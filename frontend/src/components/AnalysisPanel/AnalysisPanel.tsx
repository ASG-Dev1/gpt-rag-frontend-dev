import { Pivot, PivotItem } from "@fluentui/react";
import DOMPurify from "dompurify";

import styles from "./AnalysisPanel.module.css";

// import { SupportingContent } from "../SupportingContent";
import { AskResponse } from "../../api";
import { AnalysisPanelTabs } from "./AnalysisPanelTabs";
import PdfModal from "../PdfModal/PdfModal";
import { useState } from 'react'
// import css from '../../components/common/Button.module.css'


interface Props {
    className: string;
    activeTab: AnalysisPanelTabs;
    onActiveTabChanged: (tab: AnalysisPanelTabs) => void;
    activeCitation: string | undefined;
    citationHeight: string;
    answer: AskResponse;
}

const pivotItemDisabledStyle = { disabled: true, style: { color: "grey" } };



export const AnalysisPanel = ({ answer, activeTab, activeCitation, citationHeight, className, onActiveTabChanged }: Props) => {

    const isDisabledThoughtProcessTab: boolean = !answer.thoughts;
    // const isDisabledSupportingContentTab: boolean = !answer.data_points.length;
    // const isDisabledCitationTab: boolean = !activeCitation;
    const isDisabledItemsTab: boolean = !answer.thoughts;
    const sanitizedThoughts = DOMPurify.sanitize(answer.thoughts!);

    const Items1: AskResponse = answer
    const dataPoints = Items1.data_points;
    console.log('Items1.data_points:', Items1.data_points)

    const iframeSrc = `https://docs.google.com/gview?url=${activeCitation}&embedded=true`;

    const [isModalOpen, setIsModalOpen] = useState(false); // State to manage the modal visibility
    const [pdfData, setPdfData] = useState<{ name: string; url: string } | null>(null); // State to hold PDF data
    const isDisabledCitationTab: boolean = !activeCitation;

    // Function to extract the filename from a URL
    const extractFilename = (url: string) => {
        return url.split('/').pop()?.split('#')[0]?.split('?')[0] || "Unknown Filename"; // Extract file name from the URL
    };

    const handlePdfButtonClick = () => {
        if (activeCitation) {
            const filename = extractFilename(activeCitation);  // Get the filename from the citation URL

            setPdfData({
                name: filename,  // Set the filename as the name of the PDF
                url: activeCitation      // Use the activeCitation URL
            });
            setIsModalOpen(true);  // Open the modal when the button is clicked
        }
    };



    function extractDataFromResponse(response: AskResponse): { [key: string]: string } {
        let input = response.thoughts!;
        let tokens = input.split(' ');
        let result: { [key: string]: string } = {};
        let currentKey = '';
        let currentValue = '';

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].endsWith(':')) {
                if (currentKey) {
                    result[currentKey] = currentValue.trim();
                }
                currentKey = tokens[i].slice(0, -1);
                currentValue = '';
            } else {
                currentValue += tokens[i] + ' ';
            }
        }

        if (currentKey) {
            result[currentKey] = currentValue.trim();
        }

        return result;
    }


    const extractedData = extractDataFromResponse(Items1);
    console.log('Extracted Data:', extractedData);

    console.log(Items1.data_points);

    return (
        <>
            <Pivot
                className={className}
                selectedKey={activeTab}

                onLinkClick={pivotItem => pivotItem && onActiveTabChanged(pivotItem.props.itemKey! as AnalysisPanelTabs)}
            >

                <PivotItem
                    itemKey={AnalysisPanelTabs.Items}
                    headerText="Items"
                    headerButtonProps={isDisabledItemsTab ? pivotItemDisabledStyle : undefined}
                >
                    <div>
                        {Items1.data_points && Items1.data_points.length > 0 ? (
                            <div>{(Items1.data_points)}</div>
                        ) : (
                            <p>No data points found</p>
                        )}
                    </div>

                </PivotItem>
                {/* <PivotItem
                itemKey={AnalysisPanelTabs.CitationTab}
                headerText="Citation"
                headerButtonProps={isDisabledCitationTab ? pivotItemDisabledStyle : undefined}
                
            >
                
                <iframe title="Citation" src={iframeSrc} width="100%" height={citationHeight}/>

            </PivotItem> */}
                <PivotItem
                    itemKey={AnalysisPanelTabs.CitationTab}
                    headerText="Citation"
                    headerButtonProps={isDisabledCitationTab ? pivotItemDisabledStyle : undefined}
                >
                    <div className={styles.thoughtProcess}>
                        {activeCitation ? (
                            <button className={`${styles.itemButton} ${styles.buttonCitation}`} onClick={handlePdfButtonClick}>{extractFilename(activeCitation)}</button>  // Show the extracted file name on the button
                        ) : (
                            <p>No citation available</p>
                        )}
                    </div>
                </PivotItem>
            </Pivot>
            {/* Modal for displaying the PDF */}
            {pdfData && (
                <PdfModal
                    isOpen={isModalOpen}
                    closeModal={() => setIsModalOpen(false)}
                    data={pdfData}  // Pass the PDF data to the modal
                />
            )}
        </>
    );
}
