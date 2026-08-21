using Microsoft.Win32;

namespace Trirex360.Desktop;

internal sealed class WindowsThemeWatcher : IDisposable
{
    private const string PersonalizeKey = @"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize";

    public bool IsDarkMode { get; private set; }

    public event EventHandler<bool>? ThemeChanged;

    public void Start()
    {
        IsDarkMode = ReadIsDarkMode();
        SystemEvents.UserPreferenceChanged += OnUserPreferenceChanged;
    }

    public void Dispose()
    {
        SystemEvents.UserPreferenceChanged -= OnUserPreferenceChanged;
    }

    private void OnUserPreferenceChanged(object sender, UserPreferenceChangedEventArgs eventArgs)
    {
        var isDarkMode = ReadIsDarkMode();
        if (isDarkMode == IsDarkMode)
        {
            return;
        }

        IsDarkMode = isDarkMode;
        ThemeChanged?.Invoke(this, isDarkMode);
    }

    private static bool ReadIsDarkMode()
    {
        using var key = Registry.CurrentUser.OpenSubKey(PersonalizeKey);
        return key?.GetValue("AppsUseLightTheme") is not int appsUseLightTheme
               || appsUseLightTheme != 1;
    }
}