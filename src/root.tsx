import { createSignal, For, Show, Suspense, onCleanup, onMount, createEffect } from "solid-js";
import { useLocation, A, Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title } from "solid-start";
import "./root.css";
import PAGES from "~/constants";
import Cookies from "universal-cookie";

type theme = "light" | "dark";
export default function Root() {
    const currentYear = new Date().getFullYear();
    const location = useLocation();
    const cookies = new Cookies();
    const [theme, setTheme] = createSignal<theme>(cookies.get("theme") === "dark" ? "dark" : "light");

    const yoe =  Math.max(1, new Date().getFullYear() - new Date("2023-01-30").getFullYear())



    return (
        <Html lang="en" class={`h-full flex flex-col ${theme()}`}>
            <Head>
                <Title>damon</Title>
                <Meta charset="utf-8" />
                <Meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta name="og:title" content="damon" />
                <Meta name="og:description" content={`a software engineer based in the u.s.a. with ${yoe} year${yoe > 1 ? 's' : ''} of experience.`} />
                <Meta name="og:url" content="https://damon.systems" />
                <Meta name="og:image" content="https://damon.systems/think.png" />

                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Body class="flex flex-grow flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    <Suspense>
                        <ErrorBoundary>
                            <nav class="flex justify-between p-5">
                                <A href={"/"} class="text-4xl italic">
                                    damon
                                </A>
                            </nav>
                            <div class="flex-grow overflow-hidden">
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
                            <A target="" href={`/${page.path}`} class={`mr-2 hover-underline ${location.pathname === `/${page.path}` ? "font-bold" : ""}`}>
                                <Show when={index() !== 0}>
                                    <span class="mr-1">○</span>
                                </Show>
                                {page.name}
                            </A>
                        )}
                    </For>
                    <span class="mr-2">]</span>
                    <p>© {currentYear} Damon</p>
                    <p>Made with SolidStart</p>
                </footer>
            </Show>
        </Html>
    );
}