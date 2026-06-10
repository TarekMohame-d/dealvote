/**
 * Login Verify Email page (login-verify-email.ftl)
 * Renders notice notifying the user that a verification link was dispatched to their email address.
 */
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { kcSanitize } from "keycloakify/lib/kcSanitize";

import LogoDark from "../assets/dark_logo.svg";
import clsx from "clsx";
import { OctagonAlert } from "lucide-react";

export default function LoginVerifyEmail(props: PageProps<Extract<KcContext, { pageId: "login-verify-email.ftl" }>, I18n>) {
    const { kcContext, i18n, Template, classes } = props;
    const { url, user, messagesPerField } = kcContext;
    const { msg } = i18n;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={false}
            classes={classes}
            displayMessage={false}
            displayInfo={false}
            headerNode={null}
            infoNode={null}
            {...{ doUseDefaultLayout: false }}
        >
            <div className="font-ibm relative isolate flex h-screen w-full items-center justify-center p-4">
                <div className="absolute top-0 z-[-2] h-screen w-screen rotate-180 transform bg-white bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(232,93,4,.5)_100%)]"></div>
                <div className="flex w-full flex-col overflow-hidden rounded-xl bg-[#f8f9fa] md:w-3/5">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-black/10 p-5">
                        <h1 className="text-xl font-bold text-black md:text-2xl">{msg("emailVerifyTitle")}</h1>
                        <img src={LogoDark} alt="Logo" className="w-20 object-contain md:w-30" />
                    </div>

                    {/* Body */}
                    <div className="p-5">
                        {/* Error Messages */}
                        {(messagesPerField.existsError("username", "password") || kcContext.message) && (
                            <div
                                className={clsx(
                                    "mb-3 flex items-center gap-2 rounded-lg border p-3 text-sm",
                                    kcContext.message?.type === "warning"
                                        ? "border-orange-200 bg-orange-50 text-orange-600"
                                        : kcContext.message?.type === "error"
                                          ? "border-red-200 bg-red-50 text-red-600"
                                          : kcContext.message?.type === "success"
                                            ? "border-green-200 bg-green-50 text-green-600"
                                            : "border-blue-200 bg-blue-50 text-blue-600"
                                )}
                            >
                                <OctagonAlert className="h-4 w-4 shrink-0" />
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: messagesPerField.existsError("username", "password")
                                            ? kcSanitize(messagesPerField.getFirstError("username", "password"))
                                            : kcSanitize(kcContext.message?.summary || "")
                                    }}
                                />
                            </div>
                        )}

                        <p className="text-sm text-gray-800">{msg("emailVerifyInstruction1", user?.email ?? "")}</p>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-black/10 bg-white p-5">
                        <p className="text-sm text-gray-800">
                            {msg("emailVerifyInstruction2")}{" "}
                            <a href={url.loginAction} className="font-semibold text-black hover:underline">
                                {msg("doClickHere")}
                            </a>{" "}
                            {msg("emailVerifyInstruction3")}
                        </p>
                    </div>
                </div>
            </div>
        </Template>
    );
}
