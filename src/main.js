/**
 * The frontend JavaScript functionality for the BeepChecker application.
 *
 * This file handles the interaction with the Tauri backend to play different
 * types of beeps, as well as managing user input for custom beep settings. It
 * also includes error handling and UI updates for displaying error messages.
 *
 * @copyright Copyright (c) The Hello World Writer
 * @license MIT
 * @website https://www.thehelloworldwriter.com
 */

// @ts-check

// @ts-ignore
const app = /** @type {NonNullable<typeof window.__TAURI__>} */ (window.__TAURI__);
const { invoke } = app.core;
const { getCurrentWindow } = app.window;
const { getVersion } = app.app;

const appTitle = "BeepChecker";

/** The error snackbar element where error messages are displayed */
let errorSnackbar;

/**
 * Displays an error message in the error snackbar.
 * @param {string} message - The error message to display.
 */
function showError(message) {
  if (errorSnackbar) {
    errorSnackbar.textContent = message;
    errorSnackbar.hidden = false;
    setTimeout(() => errorSnackbar.hidden = true, 5000); // Hide after 5 seconds
  }
}

/**
 * Function to invoke the `message_beep` command from Tauri.
 * @param {number} uType - The type of beep to play.
 */
async function messageBeep(uType) {
  try {
    const result = await invoke("message_beep", { uType: uType });
    console.log(result); // Success message
  } catch (err) {
    // Log and display the error
    console.error("MessageBeep error:", err);
    showError(err);
  }
}

/**
 * Function to invoke the `beep` command from Tauri.
 * @param {number} frequency - The frequency of the beep.
 * @param {number} duration - The duration of the beep in milliseconds.
 */
async function beep(frequency, duration) {
  try {
    const result = await invoke("beep", { frequency: frequency, duration: duration });
    console.log(result); // Success message
  } catch (err) {
    // Log and display the error
    console.error("Beep error:", err);
    showError(err);
  }
}

/** Button configurations for different beep types */
const beepButtons = [
  { buttonId: "simpleBeepButton", beepType: 0xFFFFFFFF },
  { buttonId: "okBeepButton", beepType: 0x00000000 },
  { buttonId: "informationBeepButton", beepType: 0x00000040 },
  { buttonId: "questionBeepButton", beepType: 0x00000020 },
  { buttonId: "warningBeepButton", beepType: 0x00000030 },
  { buttonId: "errorBeepButton", beepType: 0x00000010 },
];


window.addEventListener("DOMContentLoaded", () => {

  // Initialize the error snackbar
  errorSnackbar = document.getElementById("errorSnackbar");

  // Attach event listeners to each button based on the beep configuration
  beepButtons.forEach(({ buttonId, beepType }) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener("click", () => messageBeep(beepType));
    }
  });

  const frequencyInput = /** @type {HTMLInputElement | null} */ (document.getElementById("frequencyInput"));
  const durationInput = /** @type {HTMLInputElement | null} */ (document.getElementById("durationInput"));

  // Attach event listener for the custom beep button
  const customBeepButton = document.getElementById("customBeepButton");
  if (customBeepButton && frequencyInput && durationInput) {
    customBeepButton.addEventListener("click", async () => {
      const frequency = parseInt(frequencyInput.value, 10);
      const duration = parseInt(durationInput.value, 10);
      if (!isNaN(frequency) && !isNaN(duration)) {
        await beep(frequency, duration);
      } else {
        console.error("Invalid frequency or duration input.");
      }
    });
  }

  // Show the app version when hovering over the website link
  const websiteLink = document.getElementById("websiteLink");
  if (websiteLink) {
    websiteLink.addEventListener("mouseenter", async () => {
      const appVersion = await getVersion();
      await getCurrentWindow().setTitle(`${appTitle} Version ${appVersion}`);
    });
    websiteLink.addEventListener("mouseleave", async () => {
      await getCurrentWindow().setTitle(appTitle);
    });
  }

  // Disable the default context menu of the WebView
  document.addEventListener("contextmenu", (event) => event.preventDefault());
});
