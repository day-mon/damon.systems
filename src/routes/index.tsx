import {createEffect, For} from "solid-js";
import {PAGES} from "~/root";
import {Meta, Title} from "@solidjs/meta";

export default function Home() {

    return (
        <>
            <Title>damon</Title>
            <Meta property="og:title" content="damon" />
            <Meta property="og:url" content="https://damon.systems" />
            <Meta property="og:image" content="/think.png" />
            <Meta property="og:type" content="website" />
            <Meta property="og:site_name" content="damon" />
            <Meta property="og:locale" content="en_US" />

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