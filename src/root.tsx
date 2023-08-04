import {createSignal, For, Show, Suspense, onCleanup, onMount, createEffect} from "solid-js";
import {useLocation, A, Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title} from "solid-start";
import "./root.css";
import PAGES from "~/constants";
import Cookies from "universal-cookie";


type theme = "light" | "dark";
export default function Root() {
    const currentYear = new Date().getFullYear();
    const location = useLocation();
    const cookies = new Cookies();
    const [theme, setTheme] = createSignal<theme>(cookies.get("theme") === "dark" ? "dark" : "light");


    onMount(() => {
        const initialTheme = cookies.get("theme") === "dark" ? "dark" : "light";
        setTheme(initialTheme);
    });

    createEffect(() => {
        cookies.set("theme", theme().toString());
    }, [theme])


    onCleanup(() => {

        console.log("Cleaning up");
        console.log("Current theme:", theme());

        // Make sure the cookie value matches the client-side state
        cookies.set("theme", theme().toString());
        console.log("Theme cookie value:", cookies.get("theme"));

    })

    const toggleTheme = () => {
        const newValue = theme() === "light" ? "dark" : "light";
        console.log("Setting theme to:", newValue);
        cookies.set("theme", newValue.toString());
        setTheme(newValue);
    }

    createEffect(() => {
        console.log("Current theme:", theme());
        console.log("Theme cookie value:", cookies.get("theme"));
    }, [theme])

    return (
        <Html lang="en" class={`h-full flex flex-col ${theme()}`}>`
            <Head>
                <Title>damon</Title>
                <Meta charset="utf-8"/>
                <Meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <Body
                class="flex-grow bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <div class="h-screen flex flex-col">
                    <Suspense>
                        <ErrorBoundary>
                            <nav class="flex justify-between p-5">
                                <A href={"/"} class="text-4xl italic">
                                    damon
                                </A>
                                {/*<div>*/}
                                {/*    <Show when={theme() === "light"}>*/}
                                {/*        <img*/}
                                {/*            src={"moon.gif"}*/}
                                {/*            onclick={toggleTheme}*/}
                                {/*            class="hover:cursor-pointer transition-all duration-300 rounded-full"*/}
                                {/*            alt="moon"*/}
                                {/*        />*/}
                                {/*    </Show>*/}
                                {/*    <Show when={theme() === "dark"}>*/}
                                {/*        <img*/}
                                {/*            src={"sun.png"}*/}
                                {/*            onclick={toggleTheme}*/}
                                {/*            class="hover:cursor-pointer transition-all duration-300"*/}
                                {/*            alt="sun"*/}
                                {/*        />*/}
                                {/*    </Show>*/}
                                {/*</div>*/}
                            </nav>
                            <div class="flex-grow overflow-y-auto">
                                <Routes>
                                    <FileRoutes/>
                                </Routes>
                            </div>
                        </ErrorBoundary>
                    </Suspense>
                    <Show when={location.pathname !== "/"}>
                        <footer class="p-5 pl-10 pr-10 text-right  text-gray-700 dark:text-gray-300">
                            <span class="mr-2">[</span>
                            <For each={PAGES}>
                                {(page, index) => (
                                    <A target="" href={`/${page.path}`} class="mr-2">
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
                </div>
                <Scripts/>
            </Body>
        </Html>
    );
}