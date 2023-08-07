import {createEffect, For} from "solid-js";
import {
    BsDiscord, BsEnvelope,
    BsEnvelopeAtFill,
    BsEnvelopePaper,
    BsGithub,
    BsInstagram,
    BsLinkedin,
    BsMailbox,
    BsTwitter
} from "solid-icons/bs";
import {IoLogoDiscord} from "solid-icons/io";
import {AiOutlineMail} from "solid-icons/ai";
import {Meta, Title} from "solid-start";

export default function Contact() {

    const socials = [
        {name: 'twitter', url: 'https:///twitter.com/lisp', emoji: <BsTwitter class={'hover:text-blue-500 dark:hover:text-blue-500 text-blue-500 md:text-black md:dark:text-white inline-block'}/>},
        {
            name: 'instagram',
            url: 'https://instagram.com/adopted',
            emoji: <BsInstagram class={'hover:text-pink-500 dark:hover:text-pink-500 text-pink-500 md:text-black md:dark:text-white inline-block'}/>
        },
        {
            name: 'github',
            url: 'https://github.com/day-mon',
            emoji: <BsGithub class={'dark:text-white text-black md:text-black md:dark:text-white inline-block'}/>},
        {
            name: 'linkedin',
            url: 'https://www.linkedin.com/in/day-mon/',
            emoji: <BsLinkedin class={'hover:text-blue-500 dark:hover:text-blue-500 text-blue-500 md:text-black md:dark:text-white inline-block'}/>
        },
        {
            name: 'discord',
            url: 'https://discord.com/users/105141507996061696',
            emoji: <BsDiscord class="text-[#7289DA] md:text-black dark:text-white  md:hover:text-[#7289DA]"/>,
        }
    ];

    return (
        <div>
            <Title>damon | contact</Title>
            <Meta name="description" content="contact me"/>
            <Meta name="keywords" content="damon, contact, email, twitter, instagram, github, linkedin"/>
            <Meta name="author" content="damon"/>
            <Meta property="og:title" content="damon | contact"/>
            <Meta property="og:description" content="here are some of my links and ways to contact me"/>
            <Meta property="og:image" content="/contact.png"/>
            <Meta property="og:url" content="https://damon.systems/contact"/>
            <Meta property="og:site_name" content="damon"/>
            <Meta property="og:type" content="website"/>
            <main class="h-[85vh] flex items-center justify-center animate-fade-in">
                <div class={'text-center'}>
                    <h2 class="text-lg mt-6  font-bold">socials</h2>
                    <div class={'flex items-center gap-6 justify-center mt-4'}>
                        <For each={socials}>
                            {(social, index) => (
                                <span class={'transition-all hover:scale-150'}>
                                    <a href={social.url} target={'_blank'} class="flex items-center text-2xl">{social.emoji} </a>
                                </span>
                            )}
                        </For>
                    </div>
                    <a class={'flex items-center justify-center mt-6 gap-2 transition-transform hover:scale-110'} href={'mailto:damon@montague.im'}><BsEnvelope class="inline-block w-6 h-6"/>
                        <span class="hover:underline"> damon@montague.im </span>
                    </a>


                </div>
            </main>
        </div>
    );
}