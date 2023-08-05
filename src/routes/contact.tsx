import { For } from "solid-js";

export default function Contact() {
    const socials = [
        { name: 'twitter', url: 'http://twitter.com/lisp', emoji: '🐦' },
        { name: 'instagram', url: 'https://instagram.com/adopted', emoji: '📷' },
        { name: 'github', url: 'https://github.com/day-mon', emoji: '🐙' },
        { name: 'linkedin', url: 'https://www.linkedin.com/in/day-mon/', emoji: '👔' },
    ];

    return (
        <main class="flex flex-col justify-center mb-4 items-center h-[85vh] text-center px-4 sm:px-0 space-y-6 animate-fade-in">
            <h1 class="text-xl sm:text-2xl italic mb-2">here are some of my links and ways to contact me</h1>
            <div>
                <h2 class="text-lg font-bold">socials 🌐</h2>
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
                    <li>📧 email: <a href="mailto:damon@montague.im" class="hover:underline">damon@montague.im</a></li>
                    <li>💬 discord: damonjr</li>

                </ul>
            </div>
        </main>
    );
}