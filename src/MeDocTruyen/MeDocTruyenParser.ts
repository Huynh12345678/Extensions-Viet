import { MangaTile, SearchRequest } from "paperback-extensions-common";

const entities = require("entities"); //Import package for decoding HTML entities

export interface UpdatedManga {
    ids: string[];
    loadMore: boolean;
}

export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const generateSearch = (query: SearchRequest): string => {
    let keyword: string = query.title ?? "";
    return encodeURI(keyword);
}

export const parseSearch = ($: any, query: any): MangaTile[] => {
    const manga: MangaTile[] = [];
    var dt = $.html().match(/<script.*?type=\"application\/json\">(.*?)<\/script>/);
    if (dt) dt = JSON.parse(dt[1]);
    var novels = query.title ? dt.props.pageProps.initialState.search.searchResult.storys : dt.props.pageProps.initialState.classify.comics;
    var el = query.title ? $('.listCon > a').toArray() : $('.classifyList > a').toArray();
    for (var i = 0; i < el.length; i++) {
        var e = el[i];
        manga.push(createMangaTile({
            id: $(e).attr('href'),
            image: novels[i].coverimg,
            title: createIconText({ text: novels[i].title }),
            subtitleText: createIconText({ text: 'Chapter ' + novels[i].chapter_num }),
        }))
    }
    return manga;
}

export const parseViewMore = ($: any): MangaTile[] => {
    const manga: MangaTile[] = [];
    var dt = $.html().match(/<script.*?type=\"application\/json\">(.*?)<\/script>/);
    if (dt) dt = JSON.parse(dt[1]);
    var novels = dt.props.pageProps.initialState.more.moreList.list;
    var covers: any = [];
    novels.forEach((v: any) => {
        covers.push({
            image: v.coverimg,
            title: v.title,
            chapter: 'Chapter ' + v.chapter_num
        })
    })
    var el = $('.morelistCon a').toArray();
    for (var i = 0; i < el.length; i++) {
        var e = el[i];
        manga.push(createMangaTile(<MangaTile>{
            id: $(e).attr("href"), // e.attribs['href']
            image: covers[i].image,
            title: createIconText({ text: covers[i].title }),
            subtitleText: createIconText({ text: covers[i].chapter }),
        }));
    }
    return manga;
}

export const isLastPage = ($: CheerioStatic): boolean => {
    let isLast = false;
    const pages = [];

    for (const page of $("a", ".page_floor").toArray()) {
        const p = Number($(page).text().trim());
        if (isNaN(p)) continue;
        pages.push(p);
    }
    const lastPage = Math.max(...pages);
    const currentPage = Number($(".page_floor > a.focus").text().trim());
    if (currentPage >= lastPage) isLast = true;
    return isLast;
}

const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str);
}

export function ChangeToSlug(title: any) {
    var title, slug;

    //?????i ch??? hoa th??nh ch??? th?????ng
    slug = title.toLowerCase();

    //?????i k?? t??? c?? d???u th??nh kh??ng d???u
    slug = slug.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/gi, 'a');
    slug = slug.replace(/??|??|???|???|???|??|???|???|???|???|???/gi, 'e');
    slug = slug.replace(/i|??|??|???|??|???/gi, 'i');
    slug = slug.replace(/??|??|???|??|???|??|???|???|???|???|???|??|???|???|???|???|???/gi, 'o');
    slug = slug.replace(/??|??|???|??|???|??|???|???|???|???|???/gi, 'u');
    slug = slug.replace(/??|???|???|???|???/gi, 'y');
    slug = slug.replace(/??/gi, 'd');
    //X??a c??c k?? t??? ?????t bi???t
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
    //?????i kho???ng tr???ng th??nh k?? t??? g???ch ngang
    slug = slug.replace(/ /gi, "-");
    //?????i nhi???u k?? t??? g???ch ngang li??n ti???p th??nh 1 k?? t??? g???ch ngang
    //Ph??ng tr?????ng h???p ng?????i nh???p v??o qu?? nhi???u k?? t??? tr???ng
    slug = slug.replace(/\-\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-/gi, '-');
    slug = slug.replace(/\-\-/gi, '-');
    //X??a c??c k?? t??? g???ch ngang ??? ?????u v?? cu???i
    slug = '@' + slug + '@';
    slug = slug.replace(/\@\-|\-\@|\@/gi, '');
    //In slug ra textbox c?? id ???slug???
    return slug
}
