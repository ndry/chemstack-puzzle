import { css } from "@emotion/css";

export const buttonCss = css`
& {
    font-size: 100%;
    font-family: 'Bahnschrift', sans-serif;

    background-color: #ffffffff;
    color: #283C5A;
    border: none;
    border-radius: 4px;
    margin: 5px;
    padding: 5px;
}
&:disabled {
    background-color: #ffffff90;
}
`;