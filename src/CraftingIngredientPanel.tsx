import { SubstanceId } from "./crafting";
import { CraftingIngredientButton } from "./CraftingIngredientButton";
import { JSX } from "preact";
import { useRecoilValue } from "recoil";
import { tutorialRecoil } from "./tutorialRecoil";
import { levelPresetRecoil } from "./LevelList";
import { TouchAppAnimation } from "./TouchAppAnimation";
import * as flex from "./utils/flex";
import { css, cx } from "@emotion/css";


export function CraftingIngredientPanel({
    style, className,
}: {
    style?: JSX.CSSProperties;
    className?: string;
}) {
    const tutorial = useRecoilValue(tutorialRecoil);
    const needHint = (sid: SubstanceId) => tutorial.some(t =>
        t.kind === "addIngredient"
        && t.ingredientId === sid);

    const { ingredientCount } = useRecoilValue(levelPresetRecoil);
    const ingredients = Array.from({ length: ingredientCount }, (_, i) => i);

    const touchAppAnimationCss = css`& {
        position: absolute;
        left: 32px;
        bottom: 10px;
    }`;

    return <div
        className={cx(
            css`& { transform: translate3d(0, 0, 10px); }`,
            className,
        )}
        style={{ ...flex.rowS, ...style }}
    >
        <div style={{ ...flex.rowS, flex: 1 }}>
            {ingredients
                .filter((_, i) => !(i > 2))
                .map(sid => <div style={{ position: "relative", }}>
                    <CraftingIngredientButton sid={sid} />
                    {needHint(sid) && <TouchAppAnimation className={touchAppAnimationCss} />}
                </div>)}
        </div>
        <div style={{ ...flex.rowRevS, flex: 1 }}>
            {ingredients
                .filter((_, i) => (i > 2))
                .map(sid => <div style={{ position: "relative", }}>
                    <CraftingIngredientButton sid={sid} mirrored />
                    {needHint(sid) && <TouchAppAnimation className={touchAppAnimationCss} />}
                </div>)}
        </div>
    </div>
}