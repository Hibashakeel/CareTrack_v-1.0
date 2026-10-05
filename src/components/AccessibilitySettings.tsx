import React, { useEffect, useState } from "react";
import {
  Accessibility,
  X,
  Check,
  RotateCcw,
  Type,
  Contrast,
  Move,
  Maximize,
} from "lucide-react";

type TextSize =
  | "small"
  | "default"
  | "large"
  | "extra-large";

type FontFamily =
  | "default"
  | "arial"
  | "verdana"
  | "georgia";

interface Preferences {
  textSize: TextSize;
  fontFamily: FontFamily;
  highContrast: boolean;
  reduceMotion: boolean;
  comfortableSpacing: boolean;
}

const STORAGE_KEY =
  "caretrack-accessibility-preferences";

const DEFAULT_PREFERENCES: Preferences = {
  textSize: "default",
  fontFamily: "default",
  highContrast: false,
  reduceMotion: false,
  comfortableSpacing: false,
};

function getSavedPreferences(): Preferences {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      return {
        ...DEFAULT_PREFERENCES,
        ...parsed,
        fontFamily:
          parsed.fontFamily || "default",
      };
    }
  } catch {
    // Use default preferences if saved data is invalid.
  }

  return DEFAULT_PREFERENCES;
}

function applyPreferences(
  settings: Preferences
) {
  const root = document.documentElement;

  root.setAttribute(
    "data-caretrack-text-size",
    settings.textSize
  );

  root.setAttribute(
    "data-caretrack-font",
    settings.fontFamily
  );

  root.setAttribute(
    "data-caretrack-high-contrast",
    String(settings.highContrast)
  );

  root.setAttribute(
    "data-caretrack-reduce-motion",
    String(settings.reduceMotion)
  );

  root.setAttribute(
    "data-caretrack-spacing",
    String(settings.comfortableSpacing)
  );

  // Remove any old theme attribute saved by
  // the previous version of AccessibilitySettings.
  root.removeAttribute(
    "data-caretrack-theme"
  );
}

export default function AccessibilitySettings() {
  const [settings, setSettings] =
    useState<Preferences>(
      getSavedPreferences()
    );

  const [isOpen, setIsOpen] =
    useState(false);

  useEffect(() => {
    applyPreferences(settings);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settings)
    );
  }, [settings]);

  function updateSettings(
    changes: Partial<Preferences>
  ) {
    setSettings((current) => ({
      ...current,
      ...changes,
    }));
  }

  function resetSettings() {
    setSettings({
      ...DEFAULT_PREFERENCES,
    });
  }

  return (
    <>
      {/* ACCESSIBILITY FLOATING BUTTON */}
      <button
        type="button"
        aria-label="Accessibility settings"
        onClick={() =>
          setIsOpen((current) => !current)
        }
        style={{
          position: "fixed",
          right: "22px",
          bottom: "22px",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "1px solid #c8dfe1",
          background: "#ffffff",
          color: "#0056dd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 9999,
          boxShadow:
            "0 6px 20px rgba(0,0,0,0.16)",
        }}
      >
        <Accessibility size={23} />
      </button>

      {/* ACCESSIBILITY PANEL */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            right: "22px",
            bottom: "82px",
            width: "330px",
            maxWidth:
              "calc(100vw - 32px)",
            maxHeight:
              "calc(100vh - 110px)",
            overflowY: "auto",
            background: "#ffffff",
            border:
              "1px solid rgba(130,147,160,0.3)",
            borderRadius: "16px",
            boxShadow:
              "0 15px 40px rgba(0,0,0,0.20)",
            zIndex: 9999,
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom:
                "1px solid rgba(130,147,160,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "9px",
                  background: "#eef6ff",
                  color: "#0056dd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Accessibility size={19} />
              </div>

              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#17324d",
                  }}
                >
                  Accessibility
                </div>

                <div
                  style={{
                    fontSize: "10px",
                    marginTop: "2px",
                    color: "#8293a0",
                  }}
                >
                  Customize your CareTrack
                  experience
                </div>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close accessibility settings"
              onClick={() =>
                setIsOpen(false)
              }
              style={{
                border: "none",
                background: "transparent",
                color: "#8293a0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ padding: "16px" }}>
            {/* TEXT SIZE */}
            <div
              style={{
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  marginBottom: "9px",
                  color: "#0056dd",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <Type size={16} />
                Text Size
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(4, 1fr)",
                  gap: "6px",
                }}
              >
                <TextButton
                  label="Small"
                  selected={
                    settings.textSize ===
                    "small"
                  }
                  onClick={() =>
                    updateSettings({
                      textSize: "small",
                    })
                  }
                />

                <TextButton
                  label="Default"
                  selected={
                    settings.textSize ===
                    "default"
                  }
                  onClick={() =>
                    updateSettings({
                      textSize: "default",
                    })
                  }
                />

                <TextButton
                  label="Large"
                  selected={
                    settings.textSize ===
                    "large"
                  }
                  onClick={() =>
                    updateSettings({
                      textSize: "large",
                    })
                  }
                />

                <TextButton
                  label="Extra"
                  selected={
                    settings.textSize ===
                    "extra-large"
                  }
                  onClick={() =>
                    updateSettings({
                      textSize:
                        "extra-large",
                    })
                  }
                />
              </div>
            </div>

            {/* FONT STYLE */}
            <div
              style={{
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  marginBottom: "9px",
                  color: "#0056dd",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <Type size={16} />
                Font Style
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "6px",
                }}
              >
                <TextButton
                  label="Default"
                  selected={
                    settings.fontFamily ===
                    "default"
                  }
                  onClick={() =>
                    updateSettings({
                      fontFamily:
                        "default",
                    })
                  }
                />

                <TextButton
                  label="Arial"
                  selected={
                    settings.fontFamily ===
                    "arial"
                  }
                  onClick={() =>
                    updateSettings({
                      fontFamily: "arial",
                    })
                  }
                />

                <TextButton
                  label="Verdana"
                  selected={
                    settings.fontFamily ===
                    "verdana"
                  }
                  onClick={() =>
                    updateSettings({
                      fontFamily:
                        "verdana",
                    })
                  }
                />

                <TextButton
                  label="Georgia"
                  selected={
                    settings.fontFamily ===
                    "georgia"
                  }
                  onClick={() =>
                    updateSettings({
                      fontFamily:
                        "georgia",
                    })
                  }
                />
              </div>
            </div>

            {/* HIGH CONTRAST */}
            <ToggleRow
              icon={<Contrast size={17} />}
              title="High Contrast"
              description="Improve visibility of text and interface elements."
              enabled={
                settings.highContrast
              }
              onClick={() =>
                updateSettings({
                  highContrast:
                    !settings.highContrast,
                })
              }
            />

            {/* REDUCE MOTION */}
            <ToggleRow
              icon={<Move size={17} />}
              title="Reduce Motion"
              description="Reduce animations and transitions."
              enabled={
                settings.reduceMotion
              }
              onClick={() =>
                updateSettings({
                  reduceMotion:
                    !settings.reduceMotion,
                })
              }
            />

            {/* COMFORTABLE SPACING */}
            <ToggleRow
              icon={<Maximize size={17} />}
              title="Comfortable Spacing"
              description="Add more space between interface elements."
              enabled={
                settings.comfortableSpacing
              }
              onClick={() =>
                updateSettings({
                  comfortableSpacing:
                    !settings.comfortableSpacing,
                })
              }
            />

            {/* RESET */}
            <button
              type="button"
              onClick={resetSettings}
              style={{
                width: "100%",
                height: "38px",
                marginTop: "16px",
                border:
                  "1px solid #d7e1e5",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#536b7b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              <RotateCcw size={14} />
              Reset Preferences
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   TEXT SIZE BUTTON
   ========================================================= */

function TextButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: "52px",
        border: selected
          ? "2px solid #0056dd"
          : "1px solid #dce5ea",
        borderRadius: "8px",
        background: selected
          ? "#eef6ff"
          : "#ffffff",
        color: selected
          ? "#0056dd"
          : "#536b7b",
        cursor: "pointer",
        fontSize: "9px",
        fontWeight: 700,
      }}
    >
      <span
        style={{
          display: "block",
          fontSize:
            label === "Small"
              ? "14px"
              : label === "Default"
                ? "16px"
                : label === "Large"
                  ? "19px"
                  : label === "Extra"
                    ? "21px"
                    : "15px",
          marginBottom: "3px",
        }}
      >
        A
      </span>

      {label}

      {selected && (
        <Check
          size={10}
          style={{
            display: "block",
            margin: "3px auto 0",
          }}
        />
      )}
    </button>
  );
}

/* =========================================================
   TOGGLE ROW
   ========================================================= */

function ToggleRow({
  icon,
  title,
  description,
  enabled,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: "11px 0",
        borderTop:
          "1px solid rgba(130,147,160,0.18)",
      }}
    >
      <div
        style={{
          width: "31px",
          height: "31px",
          minWidth: "31px",
          borderRadius: "8px",
          background: enabled
            ? "#eef6ff"
            : "#f3f6f8",
          color: enabled
            ? "#0056dd"
            : "#8293a0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#17324d",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: "8px",
            lineHeight: 1.4,
            marginTop: "2px",
            color: "#8293a0",
          }}
        >
          {description}
        </div>
      </div>

      <button
        type="button"
        aria-label={title}
        aria-pressed={enabled}
        onClick={onClick}
        style={{
          width: "40px",
          height: "23px",
          border: "none",
          borderRadius: "20px",
          background: enabled
            ? "#0056dd"
            : "#c9d3d9",
          padding: "3px",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            display: "block",
            width: "17px",
            height: "17px",
            borderRadius: "50%",
            background: "#ffffff",
            transform: enabled
              ? "translateX(17px)"
              : "translateX(0)",
            transition:
              "transform 0.2s ease",
          }}
        />
      </button>
    </div>
  );
}
