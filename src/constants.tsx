import {BsGithub, BsHouse, BsMusicNote, BsPhone, BsQuestionCircle} from "solid-icons/bs";
import {BiRegularNote} from "solid-icons/bi";

interface IPage {
    name: string;
    path: string
    icon: any
}

export const PAGES: IPage[] = [
    {
        name: 'home',
        path: '',
        icon: <BsHouse class={'text-md'} />
    },
    {
        name: 'about',
        path: 'about',
        icon: <BsQuestionCircle class={'text-md'} />
    },
    {
        name: 'projects',
        path: 'projects',
        icon: <BsGithub class={'text-md'} />
    },
    {
        name: 'contact',
        path: 'contact',
        icon: <BsPhone class={'text-md'} />
    }
];