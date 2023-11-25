import React, { useEffect, useState } from 'react'

type Props = {
    id: string;
    handleChange: (photo: string, check: boolean) => void;
};

const Checkbox = (props: Props) => {
    const [isChecked, setChecked] = useState(false);
    const handleChange = (photo: string) => {
        setChecked(!isChecked);
    }

    return (<div><input id={props.id} type="checkbox" checked={isChecked} onChange={() => handleChange(props.id)} /></div>)
}


export default Checkbox;