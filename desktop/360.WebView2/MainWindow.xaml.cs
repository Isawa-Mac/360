using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Threading;
using System.Runtime.InteropServices;
using Microsoft.Web.WebView2.Core;

namespace Trirex360.Desktop;

public partial class MainWindow : Window
{
    private readonly DesktopSettings _settings;
    private readonly Uri _startUri;
    private bool _isInitialized;
    private bool _isDownloadingUpdate;
    private bool _isWorkAreaMaximized;
    private Rect _normalBounds;
    private Uri? _lastCommittedUri;
    private UpdateManifest? _availableUpdate;
    private readonly WindowsThemeWatcher _themeWatcher;
    private readonly DispatcherTimer _updateCheckTimer = new() { Interval = TimeSpan.FromMinutes(60) };
    private static readonly HttpClient UpdateHttpClient = new();

    public MainWindow()
    {
        InitializeComponent();
        _settings = DesktopSettings.Load();
        _startUri = ResolveStartUri(_settings);
        _themeWatcher = new WindowsThemeWatcher();
        _themeWatcher.ThemeChanged += ThemeWatcher_ThemeChanged;
        _themeWatcher.Start();
        ApplyWindowsTheme(_themeWatcher.IsDarkMode);
        ContentRendered += MainWindow_ContentRendered;
        _updateCheckTimer.Tick += async (_, _) => await CheckForUpdateAsync();
        Closed += (_, _) =>
        {
            _updateCheckTimer.Stop();
            _themeWatcher.ThemeChanged -= ThemeWatcher_ThemeChanged;
            _themeWatcher.Dispose();
        };
    }

    private void ThemeWatcher_ThemeChanged(object? sender, bool isDarkMode)
    {
        _ = Dispatcher.InvokeAsync(() => ApplyWindowsTheme(isDarkMode));
    }

    private void ApplyWindowsTheme(bool isDarkMode)
    {
        Application.Current.Resources["WindowBackgroundBrush"] = CreateBrush(isDarkMode ? "#202020" : "#F7F8FA");
        Application.Current.Resources["ChromeBorderBrush"] = CreateBrush(isDarkMode ? "#3D3D3D" : "#D7DCE5");
        Application.Current.Resources["PrimaryTextBrush"] = CreateBrush(isDarkMode ? "#F5F5F5" : "#111827");
        Application.Current.Resources["SecondaryTextBrush"] = CreateBrush(isDarkMode ? "#C7C7C7" : "#6B7280");
        Application.Current.Resources["TitleBarButtonTextBrush"] = CreateBrush(isDarkMode ? "#F5F5F5" : "#374151");
        Application.Current.Resources["TitleBarButtonHoverBrush"] = CreateBrush(isDarkMode ? "#3A3A3A" : "#E5E7EB");
        Application.Current.Resources["TitleBarButtonPressedBrush"] = CreateBrush(isDarkMode ? "#4A4A4A" : "#D1D5DB");

        SetImmersiveDarkTitleBar(isDarkMode);
    }

    private static System.Windows.Media.SolidColorBrush CreateBrush(string color)
    {
        return new System.Windows.Media.SolidColorBrush(
            (System.Windows.Media.Color)System.Windows.Media.ColorConverter.ConvertFromString(color));
    }

    private void SetImmersiveDarkTitleBar(bool isDarkMode)
    {
        var handle = new WindowInteropHelper(this).Handle;
        if (handle == IntPtr.Zero)
        {
            return;
        }

        var useDarkMode = isDarkMode ? 1 : 0;
        _ = DwmSetWindowAttribute(handle, 20, ref useDarkMode, sizeof(int));
    }

    [DllImport("dwmapi.dll")]
    private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attribute, ref int attributeValue, int attributeSize);

    [DllImport("user32.dll")]
    private static extern IntPtr MonitorFromWindow(IntPtr hwnd, uint flags);

    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool GetMonitorInfo(IntPtr monitor, ref MonitorInfo monitorInfo);

    [DllImport("user32.dll")]
    private static extern uint GetDpiForWindow(IntPtr hwnd);

    private const uint MonitorDefaultToNearest = 2;

    [StructLayout(LayoutKind.Sequential)]
    private struct NativeRect
    {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
    private struct MonitorInfo
    {
        public int Size;
        public NativeRect Monitor;
        public NativeRect WorkArea;
        public uint Flags;
    }

    private async void MainWindow_ContentRendered(object? sender, EventArgs e)
    {
        ContentRendered -= MainWindow_ContentRendered;
        await InitializeWebViewAsync();
    }

    private async Task InitializeWebViewAsync()
    {
        LoadingPanel.Visibility = Visibility.Visible;
        ErrorPanel.Visibility = Visibility.Collapsed;

        try
        {
            var userDataFolder = ResolveUserDataFolder();

            var environment = await CoreWebView2Environment.CreateAsync(userDataFolder: userDataFolder);
            await WebView.EnsureCoreWebView2Async(environment);

            if (!_isInitialized)
            {
                ConfigureWebView();
                _isInitialized = true;
            }

            Navigate(_startUri);
            _updateCheckTimer.Start();
            await CheckForUpdateAsync();
        }
        catch (WebView2RuntimeNotFoundException)
        {
            ShowError("ไม่พบ Microsoft Edge WebView2 Runtime กรุณาติดตั้ง WebView2 Runtime แล้วเปิดโปรแกรมอีกครั้ง");
        }
        catch (Exception ex)
        {
            ShowError($"เกิดข้อผิดพลาดขณะเริ่มโปรแกรม: {ex.Message}");
        }
    }

    private void ConfigureWebView()
    {
        var core = WebView.CoreWebView2;
        core.Settings.AreDevToolsEnabled = _settings.AllowDevTools;
        core.Settings.AreDefaultContextMenusEnabled = _settings.AllowDevTools;
        core.Settings.IsStatusBarEnabled = false;
        core.Settings.IsZoomControlEnabled = true;
        core.Settings.IsBuiltInErrorPageEnabled = true;

        core.NavigationStarting += Core_NavigationStarting;
        core.NavigationCompleted += Core_NavigationCompleted;
        core.NewWindowRequested += Core_NewWindowRequested;
        core.DocumentTitleChanged += Core_DocumentTitleChanged;
        core.ProcessFailed += Core_ProcessFailed;
    }

    private void Core_NavigationStarting(object? sender, CoreWebView2NavigationStartingEventArgs e)
    {
        LoadingPanel.Visibility = Visibility.Visible;
        ErrorPanel.Visibility = Visibility.Collapsed;

        if (!Uri.TryCreate(e.Uri, UriKind.Absolute, out var uri))
        {
            return;
        }

        if (uri.Scheme is "http" or "https" && ShouldOpenInExternalBrowser(uri))
        {
            e.Cancel = true;
            LoadingPanel.Visibility = Visibility.Collapsed;
            OpenWithWindows(uri.AbsoluteUri);
            return;
        }

        if (uri.Scheme is "http" or "https" or "about" or "data")
        {
            return;
        }

        e.Cancel = true;
        OpenWithWindows(uri.AbsoluteUri);
    }

    private void Core_NavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
    {
        LoadingPanel.Visibility = Visibility.Collapsed;

        if (e.IsSuccess)
        {
            _lastCommittedUri = WebView.Source;
            ErrorPanel.Visibility = Visibility.Collapsed;
            return;
        }

        ShowError($"เปิดหน้าเว็บไม่สำเร็จ ({e.WebErrorStatus}) กรุณาตรวจสอบอินเทอร์เน็ตหรือสถานะของเซิร์ฟเวอร์");
    }

    private void Core_NewWindowRequested(object? sender, CoreWebView2NewWindowRequestedEventArgs e)
    {
        if (!Uri.TryCreate(e.Uri, UriKind.Absolute, out var uri))
        {
            e.Handled = true;
            return;
        }

        e.Handled = true;
        if (IsExternalBrowserHost(uri.Host))
        {
            OpenWithWindows(uri.AbsoluteUri);
        }
        else if (IsAllowedHost(uri.Host) || !_settings.OpenExternalHostsInBrowser)
        {
            Navigate(uri);
        }
        else
        {
            OpenWithWindows(uri.AbsoluteUri);
        }
    }

    private void Core_DocumentTitleChanged(object? sender, object e)
    {
        var documentTitle = WebView.CoreWebView2.DocumentTitle;
        Title = string.IsNullOrWhiteSpace(documentTitle) ? "360" : $"{documentTitle} — 360";
    }

    private void Core_ProcessFailed(object? sender, CoreWebView2ProcessFailedEventArgs e)
    {
        if (e.ProcessFailedKind == CoreWebView2ProcessFailedKind.BrowserProcessExited)
        {
            ShowError("WebView2 หยุดทำงาน กรุณาลองเปิดหน้าอีกครั้ง");
        }
    }

    private void Navigate(Uri uri)
    {
        if (WebView.CoreWebView2 is null)
        {
            return;
        }

        WebView.CoreWebView2.Navigate(uri.AbsoluteUri);
    }

    private bool IsAllowedHost(string host) => _settings.AllowedHosts.Any(entry =>
        entry.StartsWith('.')
            ? host.EndsWith(entry, StringComparison.OrdinalIgnoreCase)
            : host.Equals(entry, StringComparison.OrdinalIgnoreCase));

    private bool IsExternalBrowserHost(string host) => _settings.ExternalBrowserHosts.Any(entry =>
        entry.StartsWith('.')
            ? host.EndsWith(entry, StringComparison.OrdinalIgnoreCase)
            : host.Equals(entry, StringComparison.OrdinalIgnoreCase));

    private bool ShouldOpenInExternalBrowser(Uri target)
    {
        if (!IsExternalBrowserHost(target.Host))
        {
            return false;
        }

        // Allow the host when it is the app's explicit start URL, but hand off
        // cross-system navigation from the 360 portal to the regular browser.
        return _lastCommittedUri is { } current
               && !current.Host.Equals(target.Host, StringComparison.OrdinalIgnoreCase);
    }

    private static void OpenWithWindows(string target)
    {
        try
        {
            Process.Start(new ProcessStartInfo(target) { UseShellExecute = true });
        }
        catch
        {
            // Windows will ignore unsupported protocols or missing handlers.
        }
    }

    private void ShowError(string message)
    {
        LoadingPanel.Visibility = Visibility.Collapsed;
        ErrorMessage.Text = message;
        ErrorPanel.Visibility = Visibility.Visible;
    }

    private void HomeButton_Click(object sender, RoutedEventArgs e)
    {
        if (WebView.CoreWebView2 is not null)
        {
            WebView.CoreWebView2.Navigate(new Uri(new Uri(_startUri.GetLeftPart(UriPartial.Authority)), "/home").AbsoluteUri);
        }
    }

    private void ReloadButton_Click(object sender, RoutedEventArgs e)
    {
        WebView.CoreWebView2?.Reload();
    }

    private async Task CheckForUpdateAsync()
    {
        if (string.IsNullOrWhiteSpace(_settings.UpdateManifestUrl)
            || !Uri.TryCreate(_settings.UpdateManifestUrl, UriKind.Absolute, out var manifestUri)
            || manifestUri.Scheme != Uri.UriSchemeHttps)
        {
            return;
        }

        try
        {
            using var response = await UpdateHttpClient.GetAsync(manifestUri, HttpCompletionOption.ResponseHeadersRead);
            response.EnsureSuccessStatusCode();
            await using var stream = await response.Content.ReadAsStreamAsync();
            var manifest = await JsonSerializer.DeserializeAsync<UpdateManifest>(stream, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (manifest is null
                || !Version.TryParse(manifest.Version, out var remoteVersion)
                || !Version.TryParse(CurrentVersion, out var currentVersion)
                || remoteVersion <= currentVersion
                || !Uri.TryCreate(manifest.DownloadUrl, UriKind.Absolute, out var downloadUri)
                || downloadUri.Scheme != Uri.UriSchemeHttps)
            {
                return;
            }

            _availableUpdate = manifest with { DownloadUri = downloadUri };
            UpdateButton.Visibility = Visibility.Visible;
        }
        catch (Exception) when (UpdateHttpClient is not null)
        {
            // Checking for updates must never prevent the desktop app from opening.
        }
    }

    private async void UpdateButton_Click(object sender, RoutedEventArgs e)
    {
        if (_isDownloadingUpdate || _availableUpdate is null)
        {
            return;
        }

        _isDownloadingUpdate = true;
        UpdateButton.IsEnabled = false;
        ((TextBlock)UpdateButton.Content).Text = "กำลังโหลด…";

        try
        {
            var installerPath = Path.Combine(Path.GetTempPath(), $"360-Setup-{_availableUpdate.Version}-win-x64.exe");
            using var response = await UpdateHttpClient.GetAsync(_availableUpdate.DownloadUri, HttpCompletionOption.ResponseHeadersRead);
            response.EnsureSuccessStatusCode();
            await using var source = await response.Content.ReadAsStreamAsync();
            await using var target = File.Create(installerPath);
            await source.CopyToAsync(target);
            target.Close();

            Process.Start(new ProcessStartInfo(installerPath) { UseShellExecute = true });
            Close();
        }
        catch (Exception ex)
        {
            _isDownloadingUpdate = false;
            UpdateButton.IsEnabled = true;
            ((TextBlock)UpdateButton.Content).Text = "UPDATE";
            MessageBox.Show($"ดาวน์โหลดตัวอัปเดตไม่สำเร็จ: {ex.Message}", "อัปเดต 360", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    private void MinimizeButton_Click(object sender, RoutedEventArgs e)
    {
        WindowState = WindowState.Minimized;
    }

    private void MaximizeButton_Click(object sender, RoutedEventArgs e)
    {
        if (_isWorkAreaMaximized)
        {
            Left = _normalBounds.Left;
            Top = _normalBounds.Top;
            Width = _normalBounds.Width;
            Height = _normalBounds.Height;
            _isWorkAreaMaximized = false;
            return;
        }

        MaximizeToWorkArea();
    }

    private void CloseButton_Click(object sender, RoutedEventArgs e)
    {
        Close();
    }

    private void TitleBar_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
    {
        if (e.ClickCount == 2)
        {
            MaximizeButton_Click(sender, new RoutedEventArgs());
            return;
        }

        if (e.LeftButton == MouseButtonState.Pressed)
        {
            DragMove();
        }
    }

    private void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        Loaded -= MainWindow_Loaded;
        MaximizeToWorkArea();
    }

    private void MaximizeToWorkArea()
    {
        if (!_isWorkAreaMaximized)
        {
            _normalBounds = new Rect(Left, Top, Width, Height);
        }

        var workArea = GetCurrentMonitorWorkArea();
        WindowState = WindowState.Normal;
        Left = workArea.Left;
        Top = workArea.Top;
        Width = workArea.Width;
        Height = workArea.Height;
        _isWorkAreaMaximized = true;
    }

    private Rect GetCurrentMonitorWorkArea()
    {
        var handle = new WindowInteropHelper(this).Handle;
        var monitor = MonitorFromWindow(handle, MonitorDefaultToNearest);
        var monitorInfo = new MonitorInfo { Size = Marshal.SizeOf<MonitorInfo>() };

        if (monitor == IntPtr.Zero || !GetMonitorInfo(monitor, ref monitorInfo))
        {
            return SystemParameters.WorkArea;
        }

        // Win32 returns physical pixels while WPF positions windows in device-independent pixels.
        var dpi = GetDpiForWindow(handle);
        var scale = dpi > 0 ? 96d / dpi : 1d;
        var area = monitorInfo.WorkArea;

        return new Rect(
            area.Left * scale,
            area.Top * scale,
            (area.Right - area.Left) * scale,
            (area.Bottom - area.Top) * scale);
    }

    private async void RetryButton_Click(object sender, RoutedEventArgs e)
    {
        if (_isInitialized)
        {
            Navigate(WebView.Source ?? _startUri);
        }
        else
        {
            await InitializeWebViewAsync();
        }
    }

    private static Uri ResolveStartUri(DesktopSettings settings)
    {
        var commandLineUrl = Environment.GetCommandLineArgs()
            .FirstOrDefault(argument => argument.StartsWith("--url=", StringComparison.OrdinalIgnoreCase))?
            .Substring("--url=".Length);
        var configuredUrl = commandLineUrl
            ?? Environment.GetEnvironmentVariable("TRIREX_360_URL")
            ?? settings.StartUrl;

        if (!Uri.TryCreate(configuredUrl, UriKind.Absolute, out var uri) || uri.Scheme is not ("http" or "https"))
        {
            throw new InvalidOperationException($"URL เริ่มต้นไม่ถูกต้อง: {configuredUrl}");
        }

        return uri;
    }

    private static string ResolveUserDataFolder()
    {
        var requestedProfile = Environment.GetCommandLineArgs()
            .FirstOrDefault(argument => argument.StartsWith("--profile=", StringComparison.OrdinalIgnoreCase))?
            .Substring("--profile=".Length);
        var profileName = string.IsNullOrWhiteSpace(requestedProfile)
            ? "WebView2-v2"
            : new string(requestedProfile.Where(character => char.IsLetterOrDigit(character) || character is '-' or '_').ToArray());

        if (string.IsNullOrWhiteSpace(profileName))
        {
            profileName = "WebView2-v2";
        }

        return Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "TRIREX",
            "360",
            profileName);
    }

    private const string CurrentVersion = "1.0.15";
}

internal sealed class DesktopSettings
{
    public string StartUrl { get; init; } = "https://360.trirex.cloud";
    public string[] AllowedHosts { get; init; } = ["360.trirex.cloud", ".trirex.cloud", "localhost", "127.0.0.1"];
    public string[] ExternalBrowserHosts { get; init; } = [];
    public bool OpenExternalHostsInBrowser { get; init; } = true;
    public bool AllowDevTools { get; init; }
    public string UpdateManifestUrl { get; init; } = "https://360.trirex.cloud/desktop/update.json";

    public static DesktopSettings Load()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "appsettings.json");
        if (!File.Exists(path))
        {
            return new DesktopSettings();
        }

        try
        {
            return JsonSerializer.Deserialize<DesktopSettings>(
                       File.ReadAllText(path),
                       new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                   ?? new DesktopSettings();
        }
        catch (JsonException)
        {
            return new DesktopSettings();
        }
    }
}

internal sealed record UpdateManifest(string Version, string DownloadUrl)
{
    public Uri? DownloadUri { get; init; }
}
