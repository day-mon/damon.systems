import { createCookieSessionStorage } from "solid-start";

export const PAGES: IPage[] = [
    {
        name: 'home',
        path: ''
    },
    {
        name: 'about',
        path: 'about'
    },
    {
        name: 'projects',
        path: 'projects'
    },
    {
        name: 'contact',
        path: 'contact'
    },

]

export interface IDisplayable {
    name: string;
    displayName: string;
}

export interface ITheme extends IDisplayable { }

export interface IFont extends IDisplayable { }

export const THEMES: ITheme[] = [
    {
        name: 'light',
        displayName: 'Light',
    },
    {
        name: 'dark',
        displayName: 'Dark',
    },
];

export const FONTS: IFont[] = [
    {
        name: 'sans-serif',
        displayName: 'Sans-Serif',
    },
    {
        name: 'karla',
        displayName: 'Karla',
    },
];
export interface IPage {
    name: string,
    path: string
}

export default PAGES;
