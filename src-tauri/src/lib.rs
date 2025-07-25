/*!
    BeepChecker Tauri Application - Native Commands and App Entrypoint

    This Rust source file defines the native commands for BeepChecker and runs the Tauri application.
    BeepChecker is a modern rewrite of the legacy Windows Forms (.NET Framework 2.0) app, providing
    system beep functionality via Windows API calls and exposing them to the frontend through Tauri.

    Copyright (c) The Hello World Writer
    Licensed under MIT
    https://www.thehelloworldwriter.com
*/

use windows::Win32::System::Diagnostics::Debug::Beep;
use windows::Win32::System::Diagnostics::Debug::MessageBeep;
use windows::Win32::UI::WindowsAndMessaging::MESSAGEBOX_STYLE;

/// Plays a system beep sound based on the specified type.
/// 
/// Uses the `MessageBeep` Windows API function and returns a result based on the success or failure
/// of the native call.
#[tauri::command]
fn message_beep(u_type: u32) -> Result<String, String> {
    unsafe {
        match MessageBeep(MESSAGEBOX_STYLE(u_type)) {
            Ok(_) => Ok(format!("Beep with type {} played successfully", u_type)),
            Err(e) => Err(format!("Failed to play beep: {:?}", e)),
        }
    }
}

/// Plays a custom beep sound with specified frequency and duration.
/// 
/// Uses the `Beep` Windows API function and returns a result based on the success or failure of the
/// native call.
#[tauri::command]
fn beep(frequency: u32, duration: u32) -> Result<String, String> {
    unsafe {
        match Beep(frequency, duration) {
            Ok(_) => Ok(format!("Custom beep with frequency {} and duration {} played successfully", frequency, duration)),
            Err(e) => Err(format!("Failed to play custom beep: {:?}", e)),
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![message_beep, beep])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
