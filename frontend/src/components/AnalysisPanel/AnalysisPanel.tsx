import { Pivot, PivotItem } from "@fluentui/react";
import DOMPurify from "dompurify";

import styles from "./AnalysisPanel.module.css";

// import { SupportingContent } from "../SupportingContent";
import { AskResponse } from "../../api";
import { AnalysisPanelTabs } from "./AnalysisPanelTabs";
import PdfModal from "../PdfModal/PdfModal";
import { useState } from 'react'
import css from "../Common/Button.module.css"
import { AccordionItemList } from "../AccordionItemsList/AccordionItemList";
import 'bootstrap-icons/font/bootstrap-icons.css';



interface Props {
    className: string;
    activeTab: AnalysisPanelTabs;
    onActiveTabChanged: (tab: AnalysisPanelTabs) => void;
    activeCitation: string | undefined;
    citationHeight: string;
    answer: AskResponse;
    onCloseAnalysisTab: React.Dispatch<React.SetStateAction<AnalysisPanelTabs | undefined>>;
}

const pivotItemDisabledStyle = { disabled: true, style: { color: "grey" } };

export const AnalysisPanel = ({ answer, activeTab, activeCitation, citationHeight, className, onActiveTabChanged, onCloseAnalysisTab }: Props) => {

    const isDisabledThoughtProcessTab: boolean = !answer.thoughts;
    const isDisabledItemsTab: boolean = !answer.thoughts;
    const sanitizedThoughts = DOMPurify.sanitize(answer.thoughts!);
    const Items1: AskResponse = answer
    // const dataPoints = Items1?.data_points ?? [];
    const dataPoints = answer?.data_points ?? [];

    console.log('Items1.data_points:', Items1.data_points)

    const iframeSrc = `https://docs.google.com/gview?url=${activeCitation}&embedded=true`;

    const [isModalOpenForCitation, setIsModalOpenForCitation] = useState(false); // Citation modal
    const [isModalOpenForItems, setIsModalOpenForItems] = useState(false); // Items modal
    const [pdfData, setPdfData] = useState<{ name: string; url: string } | null>(null); // State to hold PDF data
    console.log("PDF Data:", pdfData);
    console.log("Modal State for Citation:", isModalOpenForCitation);
    console.log("Modal State for Items:", isModalOpenForItems);

    const isDisabledCitationTab: boolean = !activeCitation;

    // Function to extract the filename from a URL for the modal
    const extractFilename = (url: string) => {
        return url.split('/').pop()?.split('#')[0]?.split('?')[0] || "Unknown Filename"; // Extract file name from the URL
    };

    // Handle Citation PDF button click
    const handlePdfButtonClickForCitation = () => {
        if (activeCitation) {
            const filename = extractFilename(activeCitation);

            setPdfData({
                name: filename,
                url: activeCitation
            });
            setIsModalOpenForCitation(true); // Open the modal for citation
        }
    };

    // Handle data point URL click
    const handleDataPointUrlClick = (url: string) => {
        const filename = extractFilename(url);

        setPdfData({
            name: filename,
            url: url
        });
        setIsModalOpenForItems(true); // Open the modal for data points (items)
    };

    console.log('Items1.data_points type:', typeof Items1.data_points);
    console.log('Items1.data_points value:', Items1.data_points);




    function extractDataFromResponse(response: AskResponse): { [key: string]: string } {
        let input = response.thoughts ?? '';
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

    const handleCloseTab = () => {
        onCloseAnalysisTab(undefined);
    }


    const extractedData = extractDataFromResponse(Items1);
    console.log('Extracted Data:', extractedData);
    console.log(Items1.data_points);
    console.log('Items1.data_points type:', typeof Items1.data_points);
    return (
        <>
            <div className={className}>
            <div className={`${css.buttonStructure} ${styles.closeAnalysisTab}`} onClick={handleCloseTab}>
                    <i className={`bi bi-x`} style={{ color: "white" }}></i>
            </div>

                <Pivot

                    selectedKey={activeTab}
                    onLinkClick={pivotItem => pivotItem && onActiveTabChanged(pivotItem.props.itemKey! as AnalysisPanelTabs)}
                >
                    <PivotItem
                        itemKey={AnalysisPanelTabs.Items}
                        headerText="Items"
                        // headerButtonProps={dataPoints.length === 0 ? { disabled: false,  style: { color: "grey" } } : undefined}
                        headerButtonProps={
                            dataPoints.length === 0
                                ? { disabled: false, style: { color: "grey" } } // Keep grey when no data points
                                : { style: { color: "black", fontSize: '1rem' }, className: styles.pivotHeaderWhite } // White styling with custom class otherwise
                        }

                    >
                        <div>
                            {Items1.data_points && Items1.data_points.length > 0 ? (
                                Items1.data_points.map((item, index) => (
                                    <>
                                        {/* Display the fields you need in an accordion */}
                                        <AccordionItemList
                                            header={item.Marca_de_Articulo + " " + item.Modelo_de_Articulo + " (" + item.Numero_de_Caso + ")"}
                                            content={{
                                                // Requisition Details
                                                "I.  Detalles de Requisición": "title",
                                                "Número de Requisición:   ": item.Numero_de_Requisicion,
                                                "Título de Requisición:   ": item.Titulo_de_Requisicion,
                                                "Fecha Recibo de Requisición:   ": item.Fecha_Recibo_de_Requisicion,
                                                "Categoría de Requisición:   ": item.Categoria_de_Requisicion,
                                                "Subcategoría de Requisición:   ": item.SubCategoria_de_Requisicion,
                                                "Agencia:   ": item.Agencia,
                                                "Nombre de Agencia de Entrega:   ": item.Nombre_de_Agencia_de_Entrega,
                                                "Método de Adquisición:   ": item.Metodo_de_Adquisicion,

                                                // Item Details
                                                "II.  Detalles de Artículo": "title",
                                                "Descripción de Artículo:   ": item.Descripcion_de_Articulo,
                                                "Marca de Artículo:   ": item.Marca_de_Articulo,
                                                "Modelo de Artículo:   ": item.Modelo_de_Articulo,
                                                "Garantía de Artículo:   ": item.Garantia_de_Articulo,
                                                "Unidad de Medida:   ": item.Unidad_de_Medida,
                                                "Cantidad:   ": item.Cantidad,
                                                "Costo Unitario Estimado de Artículo:   ": item.Costo_Unitario_Estimado_de_Articulo,
                                                "Costo Estimado Total de Orden de Artículo:": item.Costo_Estimado_Total_de_Orden_de_Articulo,
                                                "Costo Final de Orden de Artículo:": item.Costo_Final_de_Orden_de_Articulo,

                                                // Contract & Order Information
                                                "III.  Información de Orden y Contrato": "title",
                                                "Nombre de Archivo de Orden de Compra:   ": item.Nombre_de_Archivo_de_Orden_de_Compra,
                                                "Número de Contrato:   ": item.Numero_de_Contrato,
                                                "Número de Orden de Compra:   ": item.Numero_de_Orden_de_Compra,

                                                // Supplier Information
                                                "IV.  Información de Suplidor": "title",
                                                "Nombre de Suplidor:   ": item.Nombre_de_Suplidor,
                                                "Teléfono de Contacto de Suplidor:   ": item.Telefono_de_Contacto_de_Suplidor,
                                                "Email de Suplidor:   ": item.Email_de_Suplidor,
                                            }}

                                            url={item.Url_de_Archivo_de_Orden_de_Compra}
                                            onUrlClick={handleDataPointUrlClick} // Use this for URL click in data points
                                            index={index.toString()}
                                        />
                                    </>
                                ))
                            ) : (
                                <p>No items available.</p>
                            )}
                        </div>
                    </PivotItem>

                    {/* <PivotItem
                    itemKey={AnalysisPanelTabs.CitationTab}
                    headerText="Citation"
                    // headerButtonProps={isDisabledCitationTab ? pivotItemDisabledStyle : undefined}
                    headerButtonProps={
                        isDisabledCitationTab
                            ? pivotItemDisabledStyle // Keep the disabled style if citation is disabled
                            : { style: { color: "black", fontSize: '1rem' }, className: styles.pivotHeaderWhite } // White styling with custom class otherwise
                    }
                >
                    <div className={styles.thoughtProcess}>
                        {activeCitation ? (
                            <button className={`${css.buttonStructure} ${css.buttonCitation}`} onClick={handlePdfButtonClickForCitation}>
                                {extractFilename(activeCitation)}
                            </button>
                        ) : (
                            <p>No citation available</p>
                        )}
                    </div>
                </PivotItem> */}

                </Pivot>
            </div>


            {/* Modal for displaying the PDF for  */}
            {/* {pdfData && (
                <PdfModal
                    isOpen={isModalOpenForCitation}
                    closeModal={() => setIsModalOpenForCitation(false)} // Close the citation modal
                    data={pdfData}
                />
            )} */}

            {/* Modal for displaying the PDF for data points (items) */}
            {/* {pdfData && (
                <PdfModal
                    isOpen={isModalOpenForItems}
                    closeModal={() => setIsModalOpenForItems(false)} // Close the items modal
                    data={pdfData}
                />
            )} */}

            {/* Test  */}
            {isModalOpenForCitation && pdfData && (
                <PdfModal
                    isOpen={isModalOpenForCitation}
                    closeModal={() => setIsModalOpenForCitation(false)}
                    data={pdfData}
                />
            )}

            {isModalOpenForItems && pdfData && (
                <PdfModal
                    isOpen={isModalOpenForItems}
                    closeModal={() => setIsModalOpenForItems(false)}
                    data={pdfData}
                />
            )}


        </>

    );
}
