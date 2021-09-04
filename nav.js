// Add the image to the background corresponding to the element that was just hovered
function menu_hovered(img) {
    document.styleSheets[0].deleteRule(2);
    document.styleSheets[0].insertRule(".main-navigation{background: url(" + img + ");background-color:#222222;background-size: cover;background-repeat: no-repeat;background-position: center center;  position: fixed;top: 0;left: 0;display: flex;align-items: center;width: 100%;height: 100%;transform: translateX(-100%);transition: transform var(--nav-duration);z-index: 1;}", 2);

    document.styleSheets[0].deleteRule(4);
    document.styleSheets[0].insertRule(".main-navigation:hover::after {opacity: 0.7;}", 4);
}

// Reset the background when the mouse is no longer hovering the element
function menu_reset() {
    document.styleSheets[0].deleteRule(4);
    document.styleSheets[0].insertRule(".main-navigation:hover::after {opacity: 1;}", 4);
}

// Runs when the menu is opened or closed
function menu_toggle(checkboxElem) {

    if (!checkboxElem.checked) {
        // Allow document to scroll again
        document.body.style.overflowY = "";
        // Clear the background image when the menu is closed
        document.styleSheets[0].deleteRule(2);
        document.styleSheets[0].insertRule(".main-navigation{position: fixed;top: 0;left: 0;display: flex;align-items: center;width: 100%;height: 100%;transform: translateX(-100%);transition: transform var(--nav-duration);z-index: 1;}", 2);
    }
    else {
        // Remove scrollbars when the menu is open
        document.body.style.overflowY = "hidden";
    }
}