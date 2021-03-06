import { MangaTile, SearchRequest } from "paperback-extensions-common";
import { DOMAIN } from "./CManga";

const entities = require("entities"); //Import package for decoding HTML entities
export interface UpdatedManga {
    ids: string[];
    loadMore: boolean;
}

export const generateSearch = (query: SearchRequest): string => {
    let keyword: string = query.title ?? "";
    return encodeURI(keyword);
}

export const parseSearch = (json: any, search: any): MangaTile[] => {
    const manga: MangaTile[] = [];
    // const collectedIds: string[] = [];
    if (search.top !== '') {
        for (var i of Object.keys(json[search.top])) {
            var item = json[search.top][i];
            if (!item.name) continue;
            manga.push(createMangaTile({
                id: item.url + '-' + item.id + "::" + item.url,
                image: DOMAIN + 'assets/tmp/book/avatar/' + item.avatar + '.jpg',
                title: createIconText({
                    text: titleCase(item.name),
                }),
                subtitleText: createIconText({
                    text: Number(item.total_view).toLocaleString() + ' views',
                }),
            }))
        }
    } else {
        for (var i of Object.keys(json)) {
            var item = json[i];
            if (!item.name) continue;
            manga.push(createMangaTile({
                id: item.url + '-' + item.id_book + "::" + item.url,
                image: DOMAIN + 'assets/tmp/book/avatar/' + item.avatar + '.jpg',
                title: createIconText({
                    text: titleCase(item.name),
                }),
                subtitleText: createIconText({
                    text: 'Chap ' + item.last_chapter,
                }),
            }))
        }
    }

    return manga;
}

export const parseViewMore = (json: any): MangaTile[] => {
    const manga: MangaTile[] = [];
    // const collectedIds: string[] = [];
    for (var i of Object.keys(json)) {
        var item = json[i];
        if (!item.name) continue;
        manga.push(createMangaTile({
            id: item.url + '-' + item.id_book + "::" + item.url,
            image: DOMAIN + 'assets/tmp/book/avatar/' + item.avatar + '.jpg',
            title: createIconText({
                text: titleCase(item.name),
            }),
            subtitleText: createIconText({
                text: 'Chap ' + item.last_chapter,
            }),
        }))
    }
    return manga;
}

export const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str);
}

export function decrypt_data(data: any) {
    const CryptoJS = require('crypto-js');
    var parsed = (data);
    var type = parsed.ciphertext;
    var score = CryptoJS.enc.Hex.parse(parsed.iv);
    var lastviewmatrix = CryptoJS.enc.Hex.parse(parsed.salt);
    var adjustedLevel = CryptoJS.PBKDF2("nettruyenhayvn", lastviewmatrix, {
        "hasher": CryptoJS.algo.SHA512,
        "keySize": 64 / 8,
        "iterations": 999
    });
    var queryTokenScores = { iv: '' };
    queryTokenScores["iv"] = score;
    var pixelSizeTargetMax = CryptoJS.AES.decrypt(type, adjustedLevel, queryTokenScores);
    return pixelSizeTargetMax.toString(CryptoJS.enc.Utf8);
}

export function titleCase(str: any) {   //https://stackoverflow.com/questions/32589197/how-can-i-capitalize-the-first-letter-of-each-word-in-a-string-using-javascript
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}

export function change_alias(alias: any) {
    var str = alias;
    str = str.toLowerCase();
    str = str.replace(/?? |????|??????|??????|????|????|??????|??????|??????|??????|??????|????|??????|??????|??????|??????|??????/g, "a");
    str = str.replace(/????|????|??????|??????|??????|????|??????|??????|???????|??????|???????/g, "e");
    str = str.replace(/????|????|???????|???????|????/g, "i");
    str = str.replace(/????|????|??????|??????|????|????|???????|???????|???????|???????|???????|????|??????|???????  |??????|??????|??????/g, "o");
    str = str.replace(/????|????|??????|??????|????|????|??????|??????|??????|??????|??????/g, "u");
    str = str.replace(/??????|????|??????|??????|??????/g, "y");
    str = str.replace(/?????/g, "d");
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|-|$|_/g, "-");
    /* t????m v??  thay th?????? c????c k???? t?????? ???????????c bi???????t trong chu???????i sang k???? t?????? - */
    str = str.replace(/_+_/g, ""); //thay th?????? 2- th?? nh 1-
    str = str.replace(/^\_+|\_+$/g, "");
    //c??????t b?????? k???? t?????? - ?????? ???????????u v??  cu???????i chu???????i 
    return str;
}