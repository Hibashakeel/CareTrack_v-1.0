import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  HelpCircle,
  X,
} from "lucide-react";

interface ContextualHelpProps {
  title?: string;
  children: React.ReactNode;
  size?: number;
}

export default function ContextualHelp({
  title = "Help",
  children,
  size = 16,
}: ContextualHelpProps) {
  const [open, setOpen] = useState(false);

  const containerRef =
    useRef<HTMLSpanElement>(null);

  /* =====================================================
     CLOSE WHEN CLICKING OUTSIDE
     ===================================================== */

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =====================================================
     CLOSE WITH ESCAPE KEY
     ===================================================== */

  useEffect(() => {
    if (!open) return;

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open]);

  /* =====================================================
     TOGGLE HELP
     ===================================================== */

  const toggleHelp = () => {
    setOpen((previous) => !previous);
  };

  return (
    <span
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        marginLeft: "7px",
        verticalAlign: "middle",
        lineHeight: 1,
      }}
    >
      {/* =================================================
          HELP BUTTON
          ================================================= */}

      <button
        type="button"
        aria-label={`Help: ${title}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={toggleHelp}
        style={{
          width: `${size + 8}px`,
          height: `${size + 8}px`,
          border: "none",
          padding: 0,
          borderRadius: "50%",
          background: open
            ? "#eef6ff"
            : "transparent",
          color: "#0056dd",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          transition:
            "background 0.18s ease, transform 0.18s ease",
          flexShrink: 0,
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.background =
            "#eef6ff";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.background =
            open
              ? "#eef6ff"
              : "transparent";
        }}
      >
        <HelpCircle size={size} />
      </button>

      {/* =================================================
          HELP POPUP
          ================================================= */}

      {open && (
        <div
          role="dialog"
          aria-label={title}
          aria-modal="false"
          style={{
            position: "absolute",
            zIndex: 10000,
            top: "calc(100% + 8px)",
            left: "50%",
            transform:
              "translateX(-50%)",
            width: "270px",
            maxWidth:
              "calc(100vw - 32px)",
            background: "#ffffff",
            border:
              "1px solid #dce5ea",
            borderRadius: "12px",
            boxShadow:
              "0 12px 32px rgba(25, 55, 75, 0.16)",
            overflow: "hidden",
          }}
        >
          {/* =============================================
              POPUP HEADER
              ============================================= */}

          <div
            style={{
              padding:
                "11px 12px 10px",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: "10px",
              borderBottom:
                "1px solid #edf1f3",
              background: "#f8fbfc",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: "25px",
                  height: "25px",
                  minWidth: "25px",
                  borderRadius: "7px",
                  background:
                    "#eef6ff",
                  color: "#0056dd",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <HelpCircle size={14} />
              </div>

              <strong
                style={{
                  color: "#17324d",
                  fontSize: "12px",
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow:
                    "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {title}
              </strong>
            </div>

            <button
              type="button"
              aria-label="Close help"
              onClick={() =>
                setOpen(false)
              }
              style={{
                width: "25px",
                height: "25px",
                border: "none",
                borderRadius: "6px",
                background:
                  "transparent",
                color: "#8293a0",
                cursor: "pointer",
                padding: 0,
                display: "grid",
                placeItems: "center",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  "#edf3f5";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background =
                  "transparent";
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* =============================================
              POPUP CONTENT
              ============================================= */}

          <div
            style={{
              padding: "12px",
              color: "#536b7b",
              fontSize: "11px",
              lineHeight: 1.6,
            }}
          >
            {children}
          </div>
        </div>
      )}
    </span>
  );
}