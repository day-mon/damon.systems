import { createSignal, For, Show, Suspense } from "solid-js";
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
} from "solid-start";
import "./root.css";
import PAGES from "~/constants";

export default function Root() {
    const currentYear = new Date().getFullYear();
    const location = useLocation();
    const [darkMode, setDarkMode] = createSignal(false);

    return (
        <Html
            lang="en"
            class={`h-full flex flex-col ${darkMode() ? "dark" : ""}`}
        >
            <Head>
                <Title>damon</Title>
                <Meta charset="utf-8" />
                <Meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/laptop.gif" />
            </Head>
            <Body class="flex-grow bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <div class="h-screen flex flex-col">
                    {/* Main content div */}
                    <Suspense>
                        <ErrorBoundary>
                            <nav class="flex justify-between p-5">
                                <A href={"/"} class="text-4xl italic">
                                    damon
                                </A>
                                <div>
                                    <Show when={darkMode()}>
                                        <img
                                            src={"moon.gif"}
                                            onclick={() => setDarkMode(!darkMode())}
                                            class={
                                                "hover:cursor-pointer transition-all duration-300 rounded-full"
                                            }
                                            alt={"moon"}
                                        />
                                    </Show>
                                    <Show when={!darkMode()}>
                                        <img
                                            src={"sun.gif"}
                                            onclick={() => setDarkMode(!darkMode())}
                                            class={"hover:cursor-pointer transition-all duration-300"}
                                            alt={"sun"}
                                        />
                                    </Show>
                                </div>
                            </nav>
                            <div class="flex-grow overflow-y-auto"> {/* Set initial overflow-y to auto */}
                                <Routes>
                                    <FileRoutes />
                                </Routes>
                            </div>
                        </ErrorBoundary>
                    </Suspense>
                    <Show when={location.pathname !== "/"}>
                        <footer class="pl-10 pr-10 text-right text-gray-700 dark:text-gray-300">
                            <span class={"mr-2"}>[</span>

                            <For each={PAGES}>
                                {(page, index) => (
                                    <A target="" href={`/${page.path}`} class={"mr-2"}>
                                        <Show when={index() !== 0}>
                                            <span class={" mr-1"}>○</span>
                                        </Show>
                                        {page.name}
                                    </A>
                                )}
                            </For>
                            <span class={"mr-2"}>] </span>
                            <p>© {currentYear} Damon</p>
                            <p>Made with SolidStart</p>
                        </footer>
                    </Show>
                </div>
                <Scripts />
            </Body>
        </Html>
    );
}