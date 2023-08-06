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
import Cookies from "universal-cookie";
import SettingPopup from "~/components/SettingPopup";
import {FONTS, PAGES, THEMES} from "~/constants";

type theme = "light" | "dark";
const version = "v1.0.2";
export default function Root() {
    const currentYear = new Date().getFullYear();
    const location = useLocation();
    const cookies = new Cookies();
    const [showSettings, setShowSettings] = createSignal(false);
    const [theme, setTheme] = createSignal<theme>(cookies.get("theme") ?? "light");
    const [font, setFont] = createSignal(cookies.get("font") ?? "karla");
    const yoe = Math.max(1, new Date().getFullYear() - new Date("2023-01-30").getFullYear())


    return (
        <Html lang="en" class={`h-full flex flex-col ${theme()}`}>
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
            <Body class={`flex flex-grow flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-${font()}`}>
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
                <footer class="text-right pl-5 pr-5 pb-5 text-gray-700 dark:text-gray-300">
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
                    {/*<p>Made with <a class={'hover-underline font-bold'}*/}
                    {/*                href="https://start.solidjs.com/getting-started/what-is-solidstart" target="_blank">Solid*/}
                    {/*    Start</a></p>*/}
                    <p>© {currentYear} Damon</p>
                </footer>
            </Show>
        </Html>
    );
}