import { init, identify, Identify, Types } from "@amplitude/analytics-browser";
import { appVersion } from "./appVersion";

const amplitudeApiKey = import.meta.env["VITE_AMPLITUDE_API_KEY"];
init(amplitudeApiKey ?? "stub", undefined, {
    appVersion: appVersion,
    optOut: !amplitudeApiKey || !import.meta.env.PROD,
    attribution: {
        trackPageViews: true,
    },

    ...( import.meta.env.DEV && {
        logLevel: Types.LogLevel.Verbose,
    }),
});
identify(new Identify()
    .set("location.href", location.href)
);