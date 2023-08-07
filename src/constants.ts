import { createCookieSessionStorage } from "solid-start";
import {Component} from "solid-js";



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


export default THEMES;
