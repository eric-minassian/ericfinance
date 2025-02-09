use std::{fs, path::PathBuf};

use dirs::data_local_dir;

const IDENTIFIER: &str = "com.ericfinance.app";

fn get_db_directory() -> Option<PathBuf> {
    if let Some(mut path) = data_local_dir() {
        path.push(IDENTIFIER);
        std::fs::create_dir_all(&path).ok()?;
        Some(path)
    } else {
        None
    }
}

#[tauri::command]
fn list_portfolios() -> Vec<String> {
    if let Some(dir) = get_db_directory() {
        if let Ok(entries) = fs::read_dir(dir) {
            return entries
                .filter_map(|entry| entry.ok()) // Ensure valid entries
                .map(|entry| entry.path()) // Convert DirEntry to PathBuf
                .filter(|path| path.extension().map_or(false, |ext| ext == "sqlite")) // Filter for .sqlite files
                .filter_map(|path| {
                    path.file_stem()
                        .map(|stem| stem.to_string_lossy().to_string())
                }) // Get the file stem
                .collect();
        }
    }
    vec![]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![list_portfolios])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
