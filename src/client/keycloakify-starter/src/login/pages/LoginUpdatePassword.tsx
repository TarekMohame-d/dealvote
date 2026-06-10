/**
 * Login Update Password page (login-update-password.ftl)
 * Renders standard configuration form for forcing updates on user credentials.
 */
import { useState } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

import LogoDark from "../assets/dark_logo.svg";
import { Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { LockKeyhole, Eye, EyeOff } from "lucide-react";

export default function LoginUpdatePassword(props: PageProps<Extract<KcContext, { pageId: "login-update-password.ftl" }>, I18n>) {
    const { kcContext, i18n, Template, classes } = props;
    const { url, messagesPerField, isAppInitiatedAction } = kcContext;
    const { msg, msgStr } = i18n;

    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const [isPasswordNewRevealed, setIsPasswordNewRevealed] = useState(false);
    const [isPasswordConfirmRevealed, setIsPasswordConfirmRevealed] = useState(false);
    const [clientErrors, setClientErrors] = useState({ passwordNew: false, passwordConfirm: false });

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
                        <h1 className="text-xl font-bold text-black md:text-2xl">{msg("updatePasswordTitle")}</h1>
                        <img src={LogoDark} alt="Logo" className="w-20 object-contain md:w-30" />
                    </div>

                    {/* Body */}
                    <form
                        id="kc-passwd-update-form"
                        action={url.loginAction}
                        method="post"
                        className="space-y-4 p-5"
                        noValidate
                        onSubmit={e => {
                            const formData = new FormData(e.currentTarget);
                            const passwordNew = formData.get("password-new")?.toString();
                            const passwordConfirm = formData.get("password-confirm")?.toString();

                            const errors = {
                                passwordNew: !passwordNew,
                                passwordConfirm: !passwordConfirm
                            };

                            if (errors.passwordNew || errors.passwordConfirm) {
                                e.preventDefault();
                                setClientErrors(errors);
                                return;
                            }

                            setIsSubmitDisabled(true);
                        }}
                    >
                        <Field className="flex flex-col gap-1.5">
                            <FieldLabel htmlFor="password-new">{msg("passwordNew")}</FieldLabel>
                            <InputGroup
                                className={clsx(
                                    "relative rounded-md border bg-white/85",
                                    messagesPerField.existsError("password") || clientErrors.passwordNew ? "border-red-500" : "border-gray-300"
                                )}
                            >
                                <InputGroupAddon align="inline-start">
                                    <LockKeyhole className="h-4 w-4 text-black" />
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="password-new"
                                    name="password-new"
                                    type={isPasswordNewRevealed ? "text" : "password"}
                                    className="w-full pr-10 pl-10 text-gray-500"
                                    placeholder="Enter your new password"
                                    autoComplete="new-password"
                                    onChange={() => {
                                        if (clientErrors.passwordNew) {
                                            setClientErrors(prev => ({ ...prev, passwordNew: false }));
                                        }
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordNewRevealed(!isPasswordNewRevealed)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                                >
                                    {isPasswordNewRevealed ? <EyeOff className="h-4 w-4 text-black" /> : <Eye className="h-4 w-4 text-black" />}
                                </button>
                            </InputGroup>

                            {clientErrors.passwordNew && <p className="text-sm text-red-500">New password is required</p>}
                            {!clientErrors.passwordNew && messagesPerField.existsError("password") && (
                                <span
                                    id="input-error-password"
                                    className="text-sm text-red-500"
                                    aria-live="polite"
                                    dangerouslySetInnerHTML={{
                                        __html: kcSanitize(messagesPerField.getFirstError("password"))
                                    }}
                                />
                            )}
                        </Field>

                        <Field className="flex flex-col gap-1.5">
                            <FieldLabel htmlFor="password-confirm">{msg("passwordConfirm")}</FieldLabel>
                            <InputGroup
                                className={clsx(
                                    "relative rounded-md border bg-white/85",
                                    messagesPerField.existsError("password-confirm") || clientErrors.passwordConfirm
                                        ? "border-red-500"
                                        : "border-gray-300"
                                )}
                            >
                                <InputGroupAddon align="inline-start">
                                    <LockKeyhole className="h-4 w-4 text-black" />
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="password-confirm"
                                    name="password-confirm"
                                    type={isPasswordConfirmRevealed ? "text" : "password"}
                                    className="w-full pr-10 pl-10 text-gray-500"
                                    placeholder="Confirm your new password"
                                    autoComplete="new-password"
                                    onChange={() => {
                                        if (clientErrors.passwordConfirm) {
                                            setClientErrors(prev => ({ ...prev, passwordConfirm: false }));
                                        }
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordConfirmRevealed(!isPasswordConfirmRevealed)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                                >
                                    {isPasswordConfirmRevealed ? <EyeOff className="h-4 w-4 text-black" /> : <Eye className="h-4 w-4 text-black" />}
                                </button>
                            </InputGroup>

                            {clientErrors.passwordConfirm && <p className="text-sm text-red-500">Password confirmation is required</p>}
                            {!clientErrors.passwordConfirm && messagesPerField.existsError("password-confirm") && (
                                <span
                                    id="input-error-password-confirm"
                                    className="text-sm text-red-500"
                                    aria-live="polite"
                                    dangerouslySetInnerHTML={{
                                        __html: kcSanitize(messagesPerField.getFirstError("password-confirm"))
                                    }}
                                />
                            )}
                        </Field>

                        <div id="kc-form-options" className="flex items-center gap-2">
                            <Checkbox
                                id="logout-sessions"
                                name="logout-sessions"
                                defaultChecked={true}
                                value="on"
                                className="border-black data-[state=checked]:bg-black"
                            />
                            <label htmlFor="logout-sessions" className="text-sm leading-none font-medium">
                                {msg("logoutOtherSessions")}
                            </label>
                        </div>

                        <div id="kc-form-buttons" className="flex flex-row gap-2">
                            <Button
                                id="kc-form-button-submit"
                                type="submit"
                                disabled={isSubmitDisabled}
                                className={clsx(
                                    "h-11 w-full cursor-pointer rounded-md bg-[#080808] font-semibold text-white hover:bg-black/80",
                                    isAppInitiatedAction && "w-1/2"
                                )}
                            >
                                {msgStr("doSubmit")}
                            </Button>

                            {isAppInitiatedAction && (
                                <Button
                                    className="h-11 w-1/2 cursor-pointer rounded-md border border-gray-300 bg-white font-semibold text-black hover:bg-white"
                                    type="submit"
                                    name="cancel-aia"
                                    value="true"
                                >
                                    {msg("doCancel")}
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </Template>
    );
}
