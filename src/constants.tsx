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
        icon: <BsHouse class={'text-lg'} />
    },
    {
        name: 'about',
        path: 'about',
        icon: <BsQuestionCircle class={'text-lg'} />
    },
    {
        name: 'projects',
        path: 'projects',
        icon: <BsGithub class={'text-lg'} />
    },
    {
        name: 'contact',
        path: 'contact',
        icon: <BsPhone class={'text-lg'} />
    }
];