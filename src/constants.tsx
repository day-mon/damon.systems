import {BsGithub, BsHouse, BsPhone, BsQuestionCircle} from "solid-icons/bs";

interface IPage {
    name: string;
    path: string
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
    }
];