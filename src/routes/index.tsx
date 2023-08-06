import {createEffect, For} from "solid-js";
import {A} from "solid-start";
import PAGES from "~/constants";

export default function Home() {
    createEffect(() => {
        document.title = "damon";
    });
    return (
        <>
            <main class="flex justify-end items-center h-screen p-12 animate-fade-in">
                <ul class='text-2xl space-y-4'>
                    <For each={PAGES}>{(page, _) =>
                        <li class='transition-all duration-300'>
                            <a target="" href={`/${page.path}`}>
                                <span class={'italic mr-1'}>/</span>{page.name}
                            </a>
                        </li>
                    }</For>
                </ul>
            </main>
        </>
    );
}