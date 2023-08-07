import {createSignal, For, Show, Suspense, onCleanup, onMount, createEffect} from "solid-js";
import {
    useLocation,
    A,
    Body,
    ErrorBoundary,
    FileRoutes,
    Head,
    Html,
    Meta,
    Routes,
    Scripts,
    Title,
    Link
} from "solid-start";
import "./root.css";
import SettingPopup from "~/components/SettingPopup";
import { usePrefersDark } from "@solid-primitives/media";

import { FONTS, PAGES, THEMES } from "~/constants";
import {isServer} from "solid-js/web";
import { useRequest } from "solid-start/server";
import { parseCookie } from "solid-start";

type Theme = "light" | "dark";
const version = "v1.0.2";
export default function Root() {
    const currentYear = new Date().getFullYear();
    const location = useLocation();
    const [showSettings, setShowSettings] = createSignal(false);
    const event = useRequest();
    const userTheme = parseCookie(
        isServer ? event.request.headers.get("cookie") ?? "" : document.cookie
    )["theme"] as Theme;
    const userFont = parseCookie(
        isServer ? event.request.headers.get("cookie") ?? "" : document.cookie
    )["font"] as string;
    const [theme, setTheme] = createSignal<Theme>(userTheme ?? "dark");
    const [font, setFont] = createSignal<string>(userFont ?? "karla");
    const yoe = Math.max(1, new Date().getFullYear() - new Date("2023-01-30").getFullYear())



    return (
        <Html lang="en" class={`${theme()}`}>
            <Head>
                <Title>damon</Title>
                <Meta charset="utf-8"/>
                <Meta name="viewport" content="width=device-width, initial-scale=1"/>
                <Meta name="description"
                      content={`hello! i'm damon, a software engineer based in the u.s.a. with ${yoe} year${yoe > 1 ? 's' : ''} of experience.`}/>
                <Meta name="og:description"
                      content={`hello! i'm damon, a software engineer based in the u.s.a. with ${yoe} year${yoe > 1 ? 's' : ''} of experience.`}/>
                <Meta name="og:title" content="damon"/>
                <Meta name="og:url" content="https://damon.systems"/>
                <Meta name="og:image" content="https://damon.systems/think.png"/>
                <Meta name={'version'} content={version}/>
                <Link rel="icon" href="/favicon.ico"/>
                <Link rel={'manifest'} href={'/manifest.json'}/>
            </Head>
            <Body class={`h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-${font()}`}>
                    <Suspense>
                        <ErrorBoundary>
                            <nav class="flex justify-between p-5">
                                <A href={"/"} class="text-4xl italic">
                                    damon
                                </A>

                                <SettingPopup
                                    onButtonClick={() => setShowSettings(!showSettings())}
                                    settingsOpen={showSettings}
                                    theme={theme}
                                    setTheme={setTheme}
                                    themes={THEMES}
                                    fonts={FONTS}
                                    font={font}
                                    setFont={setFont}
                                />
                            </nav>
                            <div class="flex-grow overflow-hidden" onclick={() => setShowSettings(false)}>
                                <Routes>
                                    <FileRoutes />
                                </Routes>
                            </div>
                        </ErrorBoundary>
                    </Suspense>
                <Scripts />
            </Body>
            <Show when={location.pathname !== "/"}>
                <footer class="px-5 py-3 fixed bottom-0 left-0 right-0 flex justify-center md:justify-end ">
                    <span class="mr-2">[</span>
                    <For each={PAGES}>
                        {(page, index) => (
                            <>
                                <Show when={index() !== 0}>
                                    <span class="mr-1">○</span>
                                </Show>
                                <A target="" href={`/${page.path}`}
                                   class={`mr-2 hover-underline ${location.pathname === `/${page.path}` ? "font-bold" : ""}`}>
                                    {page.name}
                                </A>
                            </>
                        )}
                    </For>
                    <span class="mr-2">]</span>
                </footer>
            </Show>
        </Html>
    );
}