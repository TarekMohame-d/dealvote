import type { PageProps } from "keycloakify/login/pages/PageProps";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { ChevronsLeft } from "lucide-react";

import LogoDark from "../assets/dark_logo.svg";

export default function Error(props: PageProps<Extract<KcContext, { pageId: "error.ftl" }>, I18n>) {
    const { kcContext, i18n, Template, classes } = props;

    const { message, client, skipLink } = kcContext;

    const { msg } = i18n;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={false}
            classes={classes}
            displayMessage={false}
            headerNode={null}
            {...{ doUseDefaultLayout: false }}
        >
            <div className="font-ibm relative isolate flex h-screen w-full items-center justify-center p-4">
                <div className="absolute top-0 z-[-2] h-screen w-screen rotate-180 transform bg-white bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(232,93,4,.5)_100%)]"></div>
                <div className="flex w-full flex-col overflow-hidden rounded-xl bg-[#f8f9fa] md:w-3/5">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-black/10 p-5">
                        <h1 className="text-xl font-bold text-black md:text-2xl">{msg("errorTitle")}</h1>
                        <img src={LogoDark} alt="Logo" className="w-20 object-contain md:w-30" />
                    </div>
                    {/* Body */}
                    <div className="p-5">
                        <div className="rounded-md bg-gray-300/60 p-2">
                            <p className="instruction" dangerouslySetInnerHTML={{ __html: kcSanitize(message.summary) }} />
                        </div>
                        {!skipLink && !!client?.baseUrl && (
                            <div className="mt-3 flex items-center text-sm text-black hover:underline">
                                <ChevronsLeft className="h-full w-4" />
                                <a id="backToApplication" href={client.baseUrl}>
                                    Back to Application
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Template>
    );
}
