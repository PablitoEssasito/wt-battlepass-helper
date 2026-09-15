import { useState } from "react";
import InfoDialog from "./InfoDialog";

const KOFI_USER = "pablitoessasito";
const KOFI_PAGE = `https://ko-fi.com/${KOFI_USER}`;
const KOFI_PANEL = `${KOFI_PAGE}/?hidefeed=true&widget=true&embed=true&preview=true`;

const CoffeeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M4 8h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Zm13 1h2.5a2.5 2.5 0 0 1 0 5H17M6 5V3M10 5V3M14 5V3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function SupportDialog() {
  // The Ko-fi frame only loads once someone actually asks for it.
  const [opened, setOpened] = useState(false);

  return (
    <InfoDialog
      triggerClassName="support-button"
      dialogClassName="support-dialog"
      label="Support"
      title="Buy me a ko-fi"
      onOpen={() => {
        setOpened(true);
        window.gtag?.("event", "support_click", { method: "ko-fi" });
      }}
      triggerLabel={
        <>
          <CoffeeIcon />
          Buy me a ko-fi
        </>
      }
    >
      <p className="support-intro">
        This calculator is free and has no ads. If it saved you some maths,
        a coffee is always welcome — and entirely optional.
      </p>
      {opened && (
        <iframe
          className="support-frame"
          src={KOFI_PANEL}
          title="Ko-fi donation panel"
        />
      )}
      <p className="info-dialog-note">
        Panel not loading? Some browsers block embedded frames.{" "}
        <a href={KOFI_PAGE} target="_blank" rel="noreferrer">
          Open it on ko-fi.com
        </a>{" "}
        instead.
      </p>
    </InfoDialog>
  );
}

export default SupportDialog;
