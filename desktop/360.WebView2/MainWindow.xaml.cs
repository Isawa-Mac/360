using System.Diagnostics;
using System.IO;
using System.Text.Json;
using System.Windows;
using Microsoft.Web.WebView2.Core;

namespace Trirex360.Desktop;

public partial class MainWindow : Window
{
    private readonly DesktopSettings _settings;
    private readonly Uri _startUri;
    private bool _isInitialized;
    private Uri? _lastCommittedUri;

    public MainWindow()
    {
        InitializeComponent();
        _settings = DesktopSettings.Load();
        _startUri = ResolveStartUri(_settings);
        ContentRendered += MainWindow_ContentRendered;
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
}

internal sealed class DesktopSettings
{
    public string StartUrl { get; init; } = "https://360.trirex.cloud";
    public string[] AllowedHosts { get; init; } = ["360.trirex.cloud", ".trirex.cloud", "localhost", "127.0.0.1"];
    public string[] ExternalBrowserHosts { get; init; } = [];
    public bool OpenExternalHostsInBrowser { get; init; } = true;
    public bool AllowDevTools { get; init; }

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
