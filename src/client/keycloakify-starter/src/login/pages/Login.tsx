/**
 * Combined Username + Password login page (login.ftl) with optional WebAuthn passkey support.
 * Renders standard login form plus conditional passkey authenticator section.
 */
import { useState } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { useScript } from "keycloakify/login/pages/Login.useScript";

import LogoDark from "../assets/dark_logo.svg";
import LogoLight from "../assets/light_logo.svg";

import { Eye, EyeOff, LockKeyhole, OctagonAlert, UserRound } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext, i18n, Template, classes } = props;
    const { realm, url, usernameHidden, login, auth, messagesPerField } = kcContext;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);
    const [isPasswordRevealed, setIsPasswordRevealed] = useState(false);
    const [clientErrors, setClientErrors] = useState({ username: false, password: false });

    const webAuthnButtonId = "authenticateWebAuthnButton";

    useScript({
        webAuthnButtonId,
        kcContext,
        i18n
    });

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={false}
            classes={classes}
            displayMessage={false}
            headerNode={null}
            displayInfo={false}
            infoNode={null}
            socialProvidersNode={null}
            {...{ doUseDefaultLayout: false }}
        >
            <div className="font-ibm relative isolate flex h-screen w-full items-center justify-center p-4 md:p-10">
                <div className="absolute top-0 z-[-2] h-screen w-screen rotate-180 transform bg-white bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(232,93,4,.5)_100%)]"></div>
                <div className="flex h-full w-full flex-col items-center justify-center gap-10 md:flex-row-reverse md:gap-0">
                    {/* Right Branding Panel */}
                    <div className="relative isolate hidden h-full w-full flex-col items-center justify-evenly overflow-hidden rounded-r-xl bg-black p-5 text-center md:flex md:w-1/2">
                        <div className="z-10 flex aspect-square w-1/4 items-center justify-center rounded-full bg-[#f8f9fa] p-6 shadow-sm">
                            <img src={LogoDark} alt="Logo" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="z-10 mb-30 flex flex-col gap-2">
                            <h1 className="leading-none font-bold text-white md:text-3xl">
                                The <span className="text-[#E85D04]">Hardware</span> Marketplace Ruled by Community!
                            </h1>
                            <p className="text-sm font-semibold text-gray-200">Upvote. Trade. Upgrade</p>
                        </div>

                        {/* Top Right Grid Pattern */}
                        <GridPattern
                            width={30}
                            height={30}
                            x={-1}
                            y={-1}
                            className={cn(
                                "mask-[radial-gradient(350px_circle_at_top_right,white,transparent)]",
                                "pointer-events-none absolute inset-0 h-full w-full stroke-white/20"
                            )}
                        />

                        {/* Bottom Left Grid Pattern */}
                        <GridPattern
                            width={30}
                            height={30}
                            x={-1}
                            y={-1}
                            className={cn(
                                "mask-[radial-gradient(350px_circle_at_bottom_left,white,transparent)]",
                                "pointer-events-none absolute inset-0 h-full w-full stroke-white/20"
                            )}
                        />
                    </div>

                    {/* Left Login Panel */}
                    <div className="flex h-full w-full flex-col items-center justify-center gap-10 rounded-xl bg-[#f8f9fa] p-5 md:w-1/2 md:rounded-l-xl md:rounded-r-none md:p-30">
                        <div className="mb-5 flex aspect-square w-1/2 items-center justify-center rounded-full bg-black p-6 shadow-sm md:hidden">
                            <img src={LogoLight} alt="Logo" className="max-h-full max-w-full object-contain" />
                        </div>

                        <div className="flex flex-col items-center text-center md:mt-0 md:items-start md:space-y-0.5 md:pb-0 md:text-left">
                            <h1 className="text-2xl font-bold tracking-tight text-black md:text-3xl">Welcome Back</h1>
                            <p className="text-xs text-gray-800 md:text-sm">Enter your email and password to continue</p>
                        </div>

                        <div className="w-full">
                            {/* Error Messages */}
                            {(messagesPerField.existsError("username", "password") || kcContext.message) && (
                                <div
                                    className={clsx(
                                        "mb-6 flex items-center gap-2 rounded-lg border p-3 text-sm",
                                        kcContext.message?.type === "error" ||
                                            kcContext.message?.type === "warning" ||
                                            messagesPerField.existsError("username", "password")
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

                            {realm.password && (
                                <form
                                    id="kc-form-login"
                                    action={url.loginAction}
                                    method="post"
                                    className="space-y-6"
                                    noValidate
                                    onSubmit={e => {
                                        const formData = new FormData(e.currentTarget);
                                        const username = formData.get("username")?.toString().trim();
                                        const password = formData.get("password")?.toString();

                                        const errors = {
                                            username: !username,
                                            password: !password
                                        };

                                        if (errors.username || errors.password) {
                                            e.preventDefault();
                                            setClientErrors(errors);
                                            return;
                                        }

                                        setIsLoginButtonDisabled(true);
                                    }}
                                >
                                    <FieldGroup className="flex flex-col gap-4">
                                        {/* Email */}
                                        <Field className="flex flex-col gap-1.5">
                                            <FieldLabel htmlFor="username">Email</FieldLabel>
                                            <InputGroup
                                                className={clsx(
                                                    "relative rounded-md border bg-white/85",
                                                    messagesPerField.existsError("username") || clientErrors.username
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                )}
                                            >
                                                <InputGroupAddon align="inline-start">
                                                    <UserRound className="h-4 w-4 text-black" />
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    id="username"
                                                    name="username"
                                                    className="pl-10 text-gray-500"
                                                    placeholder="Enter your email"
                                                    defaultValue={login.username ?? ""}
                                                    autoComplete="username"
                                                    onChange={() => clientErrors.username && setClientErrors(prev => ({ ...prev, username: false }))}
                                                    required
                                                />
                                            </InputGroup>
                                            {clientErrors.username && <p className="text-sm text-red-500">Email or Username is required</p>}
                                        </Field>

                                        {/* Password */}
                                        <Field className="flex flex-col gap-1.5">
                                            <FieldLabel htmlFor="password">Password</FieldLabel>
                                            <InputGroup
                                                className={clsx(
                                                    "relative rounded-md border bg-white/85",
                                                    messagesPerField.existsError("password") || clientErrors.password
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                )}
                                            >
                                                <InputGroupAddon align="inline-start">
                                                    <LockKeyhole className="h-4 w-4 text-black" />
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    id="password"
                                                    name="password"
                                                    type={isPasswordRevealed ? "text" : "password"}
                                                    className="pr-10 pl-10 text-gray-500"
                                                    placeholder="Enter your password"
                                                    autoComplete="current-password"
                                                    onChange={() => clientErrors.password && setClientErrors(prev => ({ ...prev, password: false }))}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setIsPasswordRevealed(!isPasswordRevealed)}
                                                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                                                >
                                                    {isPasswordRevealed ? (
                                                        <EyeOff className="h-4 w-4 text-black" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-black" />
                                                    )}
                                                </button>
                                            </InputGroup>
                                            {clientErrors.password && <p className="text-sm text-red-500">Password is required</p>}
                                        </Field>

                                        {/* Remember Me + Forgot Password */}
                                        <div className="flex items-center justify-between py-2">
                                            {realm.rememberMe && !usernameHidden && (
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id="rememberMe"
                                                        name="rememberMe"
                                                        defaultChecked={!!login.rememberMe}
                                                        className="border-black data-[state=checked]:bg-black"
                                                    />
                                                    <label htmlFor="rememberMe" className="text-sm leading-none font-medium">
                                                        Remember me
                                                    </label>
                                                </div>
                                            )}

                                            {realm.resetPasswordAllowed && (
                                                <a
                                                    href={url.loginResetCredentialsUrl}
                                                    className="ml-auto text-sm font-medium text-black hover:underline"
                                                >
                                                    Forgot Password?
                                                </a>
                                            )}
                                        </div>

                                        <input type="hidden" name="credentialId" value={auth.selectedCredential ?? ""} />

                                        {/* Action Buttons */}
                                        <div className="space-y-2">
                                            <Button
                                                type="submit"
                                                disabled={isLoginButtonDisabled}
                                                className="h-11 w-full cursor-pointer rounded-md bg-[#080808] font-semibold text-white hover:bg-black/80"
                                            >
                                                Login
                                            </Button>

                                            <div className="flex items-center justify-center gap-1.5 text-sm">
                                                <span className="text-gray-800">Don't have an account?</span>
                                                <a href={url.registrationUrl} className="font-semibold text-black hover:underline">
                                                    Sign Up
                                                </a>
                                            </div>
                                        </div>
                                    </FieldGroup>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Template>
    );
}
