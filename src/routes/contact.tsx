import { For } from "solid-js";
import {BsGithub, BsInstagram, BsLinkedin, BsTwitter} from "solid-icons/bs";
import {IoLogoDiscord} from "solid-icons/io";
import {AiOutlineMail} from "solid-icons/ai";

export default function Contact() {
    const socials = [
        { name: 'twitter', url: 'https://://twitter.com/lisp', emoji: <BsTwitter class={'inline-block text-blue-500'} /> },
        { name: 'instagram', url: 'https://instagram.com/adopted', emoji: <BsInstagram class={'inline-block text-pink-500'} /> },
        { name: 'github', url: 'https://github.com/day-mon', emoji: <BsGithub class={'inline-block'} /> },
        { name: 'linkedin', url: 'https://www.linkedin.com/in/day-mon/', emoji: <BsLinkedin class={'text-blue-500 inline-block'} /> },
    ];

    return (
        <main class="flex flex-col justify-center mb-4 items-center h-[85vh] text-center px-4 sm:px-0 space-y-6 animate-fade-in">
            <h1 class="text-xl sm:text-2xl italic mb-2">here are some of my links and ways to contact me</h1>
            <div>
                <h2 class="text-lg font-bold">socials 📱</h2>
                <hr class="w-48 h-1 mx-auto  border-0 rounded md:mb-4 bg-gradient-to-r from-black via-gray-100 to-black"/>
                <p class="flex space-x-4 justify-center mt-2">
                    <For each={socials} fallback={<span>Loading...</span>}>
                        {(social, index) => (
                            <>
                                <a href={social.url} target={'_blank'} class="hover:underline">{social.emoji} {social.name}</a>
                                {index() < socials.length - 1 && <span class="mx-2">○</span>}
                            </>
                        )}
                    </For>
                </p>
            </div>
            <div>
                <h2 class="text-lg font-bold">other 📝</h2>
                <hr class="w-48 h-1 mx-auto mb-4 border-0 rounded md:mb-4 bg-gradient-to-r from-black via-gray-100 to-black"/>
                <ul class={'space-y-2'}>
                    <li><a><AiOutlineMail class="inline-block w-6 h-6"/> email: <span class="hover:underline"> damon@montague.im </span></a></li>
                    <li><IoLogoDiscord class="inline-block w-6 h-6"/> discord: <span class="hover:underline">day-mon#0001</span></li>

                </ul>
            </div>
        </main>
    );
}