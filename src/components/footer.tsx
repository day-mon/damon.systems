import { For, Show, createEffect, createSignal } from "solid-js";
import { PAGES } from "~/constants";
import { A, useLocation } from "@solidjs/router";
import { BsGithub, BsHouse, BsPhone, BsQuestionCircle } from "solid-icons/bs";
import { JSX } from "solid-js";
import { isServer } from "solid-js/web";

export function Footer() {
    const location = useLocation();
    const [showFooter, setShowFooter] = createSignal(false);

    const iconMap: Record<string, () => JSX.Element> = {
        '': () => <BsHouse size={20} />,
        'about': () => <BsQuestionCircle size={20} />,
        'projects': () => <BsGithub size={20} />,
        'contact': () => <BsPhone size={20} />
    };
    
    createEffect(() => {
        if (!isServer) {
            const path = location.pathname;
            setShowFooter(path !== "/" && path !== "");
        }
    });

    return (
        <Show when={showFooter()}>
            <footer class="px-4 py-2 fixed bottom-4 left-0 right-0">
                <div class="flex justify-evenly md:justify-end items-center w-full max-w-screen-md mx-auto">
                    <span class="mr-2 hidden md:block text-muted-foreground">[</span>
                    <For each={PAGES}>
                        {(page, index) => (
                            <>
                                <Show when={index() !== 0}>
                                    <span class="mr-1 hidden md:block text-muted-foreground">○</span>
                                </Show>
                                <A href={`/${page.path}`} class={`md:hover-underline ${index() < PAGES.length - 1 ? "mr-2" : ""}`}>
                                    <div class="md:hidden p-2">
                                        <div class={`relative ${location.pathname === `/${page.path}` ? 'text-foreground' : 'text-muted-foreground/70'}`}>
                                            {iconMap[page.path]?.()}
                                            {location.pathname === `/${page.path}` && (
                                                <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-foreground rounded-full" />
                                            )}
                                        </div>
                                    </div>
                                    <span class={`hidden md:block ${location.pathname === `/${page.path}` ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {page.name}
                                    </span>
                                </A>
                            </>
                        )}
                    </For>
                    <span class="ml-1 hidden md:block text-muted-foreground">]</span>
                </div>
            </footer>
        </Show>
    );
}