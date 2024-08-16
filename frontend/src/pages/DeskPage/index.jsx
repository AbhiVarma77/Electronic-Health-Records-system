import { Modal } from "antd"
import PatientDetails from "../../components/PatientDetails"

import { useLocation } from "react-router-dom"
import { useEffect, useState } from "react"

const DeskPage= () =>{
    const [visible,setVisible] = useState(false)

    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const isSuccess = searchParams.get('success');

    useEffect(()=>{
        if (isSuccess){
            setVisible(true)
            // Set a timeout to automatically close the modal after 5 seconds (adjust the duration as needed)
            const timer = setTimeout(()=>{
                setVisible(false)
            },500) // 500 milliseconds = 5 seconds
            // Clear the timeout when the component unmounts to prevent memory leaks
            return () => clearTimeout(timer)
        }
    },[isSuccess])
    return (
        <div>
            {isSuccess && (
                <Modal title="Success Message" visible={visible} footer={null}>
                    <p>Success message content goes here.</p>
                </Modal>
            )}
            <PatientDetails />
            
        </div>
    )

}
export default DeskPage