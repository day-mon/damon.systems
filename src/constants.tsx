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
        icon: <BsHouse size={24} />
    },
    {
        name: 'about',
        path: 'about',
        icon: <BsQuestionCircle size={24} />
    },
    {
        name: 'projects',
        path: 'projects',
        icon: <BsGithub size={24} />
    },
    {
        name: 'contact',
        path: 'contact',
        icon: <BsPhone size={24} />
    }
];