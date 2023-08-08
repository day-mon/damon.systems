import {Component, createSignal, For, Show, Suspense} from "solid-js";
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
import {FONTS, THEMES} from "~/constants";
import {isServer} from "solid-js/web";
import { useRequest } from "solid-start/server";
import { parseCookie } from "solid-start";
import {BsGit, BsGithub, BsHammer, BsHouse, BsPhone, BsQuestionCircle} from "solid-icons/bs";

type Theme = "light" | "dark";
const version = "v1.0.2";

export interface IPage {
    name: string,
    path: string,
    icon: any
}

export const PAGES: IPage[] = [
    {
        name: 'home',
        path: '',
        icon: <BsHouse class={'text-2xl'} />
    },
    {
        name: 'about',
        path: 'about',
        icon: <BsQuestionCircle class={'text-2xl'} />
    },
    {
        name: 'projects',
        path: 'projects',
        icon: <BsGithub class={'text-2xl'} />
    },
    {
        name: 'contact',
        path: 'contact',
        icon: <BsPhone class={'text-2xl'} />

    },

]

export default function Root() {
    const location = useLocation();
    const [showSettings, setShowSettings] = createSignal(false);
    const yoe = Math.max(1, new Date().getFullYear() - new Date("2023-01-30").getFullYear())



    return (
        <Html lang="en" class={`light`}>
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
            <Body class={`h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden font-karla`}>
                    <Suspense>
                        <ErrorBoundary>
                            <nav class="flex justify-between p-5">
                                <A href={"/"} class="text-4xl italic">
                                    damon
                                </A>
                            </nav>
                            <div onclick={() => setShowSettings(false)}>
                                <Routes>
                                    <FileRoutes />
                                </Routes>
                            </div>
                        </ErrorBoundary>
                    </Suspense>
                <Scripts />
            </Body>
            <Show when={location.pathname !== "/"}>
                <footer class="px-5 py-3 fixed bottom-0 left-0 right-0 flex justify-center md:justify-end bg-white dark:bg-gray-900">
                    <span class="mr-2 hidden md:block">[</span>
                    <For each={PAGES}>
                        {(page, index) => (
                            <>
                                <Show when={index() !== 0}>
                                    <span class="mr-1 hidden md:block">○</span>
                                </Show>
                                <A target="" href={`/${page.path}`} class={`mr-2 md:hover-underline ${location.pathname === `/${page.path}` ? "font-bold" : ""}`}>
                                    <button class={`block md:hidden border rounded-lg p-3 ${location.pathname === `/${page.path}` ? "bg-gray-200 dark:bg-gray-800" : ""}`}>
                                        {page.icon}
                                    </button>
                                    <span class="hidden md:block">
                                        {page.name}
                                    </span>
                                </A>
                            </>
                        )}
                    </For>
                    <span class="mr-2 hidden md:block">]</span>
                </footer>
            </Show>
        </Html>
    );
}