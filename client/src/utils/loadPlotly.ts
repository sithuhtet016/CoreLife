type PlotlyLike = {
  newPlot: (
    element: string,
    data: unknown[],
    layout: Record<string, unknown>,
    config?: Record<string, unknown>,
  ) => void;
  relayout: (element: Element, layout: Record<string, unknown>) => void;
};

const PLOTLY_SCRIPT_ID = "corelife-plotly-script";
const PLOTLY_CDN_URL = "https://cdn.plot.ly/plotly-3.1.1.min.js";

let plotlyLoadPromise: Promise<void> | null = null;

export function ensurePlotlyLoaded(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  const globalWindow = window as Window & { Plotly?: PlotlyLike };
  if (globalWindow.Plotly) {
    return Promise.resolve();
  }

  if (plotlyLoadPromise) {
    return plotlyLoadPromise;
  }

  plotlyLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(
      PLOTLY_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Plotly script")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = PLOTLY_SCRIPT_ID;
    script.src = PLOTLY_CDN_URL;
    script.async = true;
    script.referrerPolicy = "no-referrer";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Failed to load Plotly script")),
      { once: true },
    );

    document.head.appendChild(script);
  });

  return plotlyLoadPromise;
}
