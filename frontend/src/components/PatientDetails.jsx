import { Card, Col, Input, Row } from "antd"

const PatientDetails = (patientDetails) => {
        console.log("......",patientDetails);
    return (
        <div >
            <Card>
                <h4 className='text-center'>Patient Details</h4>
                <div>
                    <Row gutter={[16, 16]} className='mb-4 mx-auto'> {/* Add spacing between rows */}
                        <Col span={24} md={12} lg={8} xl={6}>
                            <Input addonBefore="Patient ID" name="patient_id" placeholder="Patient ID"  value={patientDetails.patientDetails.id}/>
                        </Col>
                        <Col span={24} md={12} lg={8} xl={6}>
                            <Input addonBefore="Patient Name" name="patient_name" placeholder="Patient Name" value={patientDetails.patientDetails.name} />
                        </Col>
                        <Col span={24} md={12} lg={8} xl={6}>
                            <Input addonBefore="book Number" name="book_no" placeholder="book No" value={patientDetails.patientDetails.bookNumber} />
                        </Col>
                    </Row>
                </div>

                <div>
                    <Row gutter={[16, 16]} className='mb-4 mx-auto'> {/* Add spacing between rows */}
                        <Col span={24} md={12} lg={8} xl={6}>
                            <Input addonBefore="Phone No" name="phone_no" placeholder="Phone No" value={patientDetails.patientDetails.phone} />
                        </Col>

                        <Col span={24} md={12} lg={8} xl={6}>
                            <Input addonBefore="DOB" name="dob" placeholder="Date of Birth" value={patientDetails.patientDetails.dateOfBirth} />
                        </Col>

                        <Col span={24} md={12} lg={8} xl={6}>
                            <Input addonBefore="Gender" name="gender" placeholder="Gender" value={patientDetails.patientDetails.gender} />
                        </Col>
                    </Row>
                </div>
            </Card>
        </div>
    )
}

export default PatientDetails