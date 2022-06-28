export function escapeHTML(html: string) {
    const elem = document.createElement('span');

    elem.innerText = html;
    return elem.innerHTML;
}
