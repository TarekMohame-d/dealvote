/**
 * Login Reset Password page (login-reset-password.ftl)
 * Renders forgot password form requesting user's email/username.
 */
import { useState } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, UserRound } from "lucide-react";

import LogoDark from "../assets/dark_logo.svg";

export default function LoginResetPassword(props: PageProps<Extract<KcContext, { pageId: "login-reset-password.ftl" }>, I18n>) {
    const { kcContext, i18n, Template, classes } = props;
    const { url, messagesPerField } = kcContext;
    const { msg } = i18n;

    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const [clientErrors, setClientErrors] = useState({ username: false });

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={false}
            classes={classes}
            displayInfo
            displayMessage={false}
            infoNode={null}
            headerNode={null}
            {...{ doUseDefaultLayout: false }}
        >
            <div className="font-ibm relative isolate flex h-screen w-full items-center justify-center p-4">
                <div className="absolute top-0 z-[-2] h-screen w-screen rotate-180 transform bg-white bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(232,93,4,.5)_100%)]"></div>
                <div className="flex w-full flex-col overflow-hidden rounded-xl bg-[#f8f9fa] md:w-3/5">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-black/10 p-5">
                        <h1 className="text-xl font-bold text-black md:text-2xl">{msg("emailForgotTitle")}</h1>
                        <img src={LogoDark} alt="Logo" className="w-20 object-contain md:w-30" />
                    </div>

                    {/* Body */}
                    <div className="p-5">
                        <form
                            id="kc-reset-password-form"
                            action={url.loginAction}
                            method="post"
                            noValidate
                            onSubmit={e => {
                                const formData = new FormData(e.currentTarget);
                                const username = formData.get("username")?.toString().trim();

                                if (!username) {
                                    e.preventDefault();
                                    setClientErrors({ username: true });
                                    return;
                                }

                                setIsSubmitDisabled(true);
                            }}
                        >
                            <Field className="flex flex-col gap-1.5">
                                <FieldLabel htmlFor="username">Email</FieldLabel>
                                <InputGroup
                                    className={clsx(
                                        "relative rounded-md border bg-white/85",
                                        messagesPerField.existsError("username") || clientErrors.username ? "border-red-500" : "border-gray-300"
                                    )}
                                >
                                    <InputGroupAddon align="inline-start">
                                        <UserRound className="h-4 w-4 text-black" />
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        type="text"
                                        id="username"
                                        name="username"
                                        className="w-full pl-10 text-gray-500"
                                        placeholder="Enter your email"
                                        autoComplete="username"
                                        onChange={() => {
                                            if (clientErrors.username) {
                                                setClientErrors({ username: false });
                                            }
                                        }}
                                        required
                                    />
                                </InputGroup>

                                {clientErrors.username && <p className="text-sm text-red-600">Email or Username is required</p>}
                                {!clientErrors.username && messagesPerField.existsError("username") && (
                                    <span
                                        className="text-sm text-red-600"
                                        dangerouslySetInnerHTML={{
                                            __html: kcSanitize(messagesPerField.getFirstError("username"))
                                        }}
                                    />
                                )}
                            </Field>

                            <Button
                                id="kc-form-buttons"
                                type="submit"
                                disabled={isSubmitDisabled}
                                className="mt-4 h-11 w-full cursor-pointer rounded-md bg-[#080808] font-semibold text-white hover:bg-black/80"
                            >
                                Submit
                            </Button>
                        </form>

                        <div className="mt-3 flex items-center gap-1 text-sm text-black hover:underline">
                            <ChevronsLeft className="h-4 w-4" />
                            <a href={url.loginUrl}>Back to Login</a>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-black/10 bg-white p-5">
                        <p className="text-sm leading-relaxed text-gray-800">
                            Enter your email address and we will send you instructions on how to set a new password.
                        </p>
                    </div>
                </div>
            </div>
        </Template>
    );
}
