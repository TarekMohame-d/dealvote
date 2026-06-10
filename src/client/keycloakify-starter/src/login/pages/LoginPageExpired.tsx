/**
 * Login Page Expired page (login-page-expired.ftl)
 * Renders fallback links when an authentication session/flow token expires.
 */
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

import LogoDark from "../assets/dark_logo.svg";
import { OctagonAlert } from "lucide-react";

export default function LoginPageExpired(props: PageProps<Extract<KcContext, { pageId: "login-page-expired.ftl" }>, I18n>) {
    const { kcContext, i18n, Template, classes } = props;
    const { url } = kcContext;
    const { msg } = i18n;

    return (
        <Template kcContext={kcContext} i18n={i18n} doUseDefaultCss={false} classes={classes} headerNode={null} {...{ doUseDefaultLayout: false }}>
            <div className="font-ibm relative isolate flex h-screen w-full items-center justify-center p-4">
                <div className="absolute top-0 z-[-2] h-screen w-screen rotate-180 transform bg-white bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(232,93,4,.5)_100%)]"></div>

                <div className="flex w-full flex-col overflow-hidden rounded-xl bg-[#f8f9fa] md:w-3/5">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-black/10 p-5">
                        <h1 className="text-xl font-bold text-black md:text-2xl">{msg("pageExpiredTitle")}</h1>
                        <img src={LogoDark} alt="Logo" className="w-20 object-contain md:w-30" />
                    </div>

                    {/* Body */}
                    <div className="p-5">
                        {kcContext.message?.summary && (
                            <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                <OctagonAlert className="h-4 w-4 shrink-0" />
                                {kcContext.message?.summary}
                            </div>
                        )}

                        <p id="instruction1" className="text-sm leading-relaxed text-gray-800">
                            {msg("pageExpiredMsg1")}{" "}
                            <a id="loginRestartLink" href={url.loginRestartFlowUrl} className="font-semibold text-black hover:underline">
                                {msg("doClickHere")}
                            </a>
                            .
                            <br />
                            <span className="mt-2 block">
                                {msg("pageExpiredMsg2")}{" "}
                                <a id="loginContinueLink" href={url.loginAction} className="font-semibold text-black hover:underline">
                                    {msg("doClickHere")}
                                </a>
                                .
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </Template>
    );
}
