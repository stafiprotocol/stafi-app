import classNames from "classnames";
import Image from "next/image";
import bee from "public/bee.png";
import beeLight from "public/bee_light.png";

export const AnimateBee = () => {
    return (
        <div
            className={classNames("relative flex justify-center w-[3rem]",)}
        >
            <div className='w-[3rem] h-[2rem] absolute top-[.3rem] left-0 right-0 animate-beeLight'>
                <Image src={beeLight} layout="fill" alt="beeLight" />
            </div>
            <div className='w-[2.1rem] h-[1.5rem] relative mt-[.4rem] animate-beeScale'>
                <Image src={bee} layout="fill" alt="bee" />
            </div>
        </div>
    )
}