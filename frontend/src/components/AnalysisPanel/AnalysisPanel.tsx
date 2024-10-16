import { Pivot, PivotItem } from "@fluentui/react";
import DOMPurify from "dompurify";

import styles from "./AnalysisPanel.module.css";

// import { SupportingContent } from "../SupportingContent";
import { AskResponse } from "../../api";
import { AnalysisPanelTabs } from "./AnalysisPanelTabs";
import PdfModal from "../PdfModal/PdfModal";
import { useState } from 'react'
import css from '../../components/common/Button.module.css'


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
    const isDisabledItemsTab: boolean = !answer.thoughts;
    const sanitizedThoughts = DOMPurify.sanitize(answer.thoughts!);
    const Items1: AskResponse = answer
    const dataPoints = Items1?.data_points ?? [];
    console.log('Items1.data_points:', Items1.data_points)

    const iframeSrc = `https://docs.google.com/gview?url=${activeCitation}&embedded=true`;
    const [isModalOpen, setIsModalOpen] = useState(false); // State to manage the modal visibility
    const [pdfData, setPdfData] = useState<{ name: string; url: string } | null>(null); // State to hold PDF data
    const isDisabledCitationTab: boolean = !activeCitation;

    // Function to extract the filename from a URL for modal pdfbutton
    const extractFilename = (url: string) => {
        return url.split('/').pop()?.split('#')[0]?.split('?')[0] || "Unknown Filename"; // Extract file name from the URL
    };

    // modal pdfbutton 
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

    const handleDataPointUrlClick = (url: string) => {
        const filename = extractFilename(url);
        setPdfData({
            name: filename,
            url: url
        });
        setIsModalOpen(true); // Open the modal
    };

    console.log('Items1.data_points type:', typeof Items1.data_points);
    console.log('Items1.data_points value:', Items1.data_points);




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
    console.log('Items1.data_points type:', typeof Items1.data_points);

    return (
        <>
            <Pivot
                className={className}
                selectedKey={activeTab}
                onLinkClick={pivotItem => pivotItem && onActiveTabChanged(pivotItem.props.itemKey! as AnalysisPanelTabs)}
            >

                {/* <PivotItem
                    itemKey={AnalysisPanelTabs.Items}
                    headerText="Items"
                    headerButtonProps={isDisabledItemsTab ? pivotItemDisabledStyle : undefined}
                >
                    <div>
                       

                    {Items1.data_points && Items1.data_points.length > 0 ? (
                            // Check if data_points is an array; if so, join the elements into a single string
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(Array.isArray(Items1.data_points) ? Items1.data_points.join('') : Items1.data_points) }} />
                        ) : (
                            <p>No data points found</p>
                        )}



                    </div>
                </PivotItem> */}

                {/* Prueba JAMR */}
                <PivotItem
                    itemKey={AnalysisPanelTabs.Items}
                    headerText="Items"
                    // headerButtonProps={isDisabledItemsTab ? pivotItemDisabledStyle : undefined}
                    headerButtonProps={dataPoints.length === 0 ? { disabled: true, style: { color: "grey" } } : undefined}
                >
                    <div>
                        {Items1.data_points && Items1.data_points.length > 0 ? (
                            Items1.data_points.map((item, index) => (
                                <div key={index} className={styles.itemContainer}>
                                    {/* Display the fields you need */}
                                    <p><strong>Número de Caso:</strong> {item.Numero_de_Caso}</p>
                                    <p><strong>Costo Unitario Estimado de Artículo:</strong> {item.Costo_Unitario_Estimado_de_Articulo}</p>
                                    <p><strong>Fecha Recibo de Requisición:</strong> {item.Fecha_Recibo_de_Requisicion}</p>
                                    <p><strong>Número de Requisición:</strong> {item.Numero_de_Requisicion}</p>
                                    <p><strong>Título de Requisición:</strong> {item.Titulo_de_Requisicion}</p>
                                    <p><strong>Categoría de Requisición:</strong> {item.Categoria_de_Requisicion}</p>
                                    <p><strong>Subcategoría de Requisición:</strong> {item.SubCategoria_de_Requisicion}</p>
                                    <p><strong>Agencia:</strong> {item.Agencia}</p>
                                    <p><strong>Nombre de Agencia de Entrega:</strong> {item.Nombre_de_Agencia_de_Entrega}</p>
                                    <p><strong>Método de Adquisición:</strong> {item.Metodo_de_Adquisicion}</p>
                                    <p><strong>Descripción de Artículo:</strong> {item.Descripcion_de_Articulo}</p>
                                    <p><strong>Marca de Artículo:</strong> {item.Marca_de_Articulo}</p>
                                    <p><strong>Modelo de Artículo:</strong> {item.Modelo_de_Articulo}</p>
                                    <p><strong>Garantía de Artículo:</strong> {item.Garantia_de_Articulo}</p>
                                    <p><strong>Unidad de Medida:</strong> {item.Unidad_de_Medida}</p>
                                    <p><strong>Cantidad:</strong> {item.Cantidad}</p>
                                    <p><strong>Costo Estimado Total de Orden de Artículo:</strong> {item.Costo_Estimado_Total_de_Orden_de_Articulo}</p>
                                    <p><strong>Número de Contrato:</strong> {item.Numero_de_Contrato}</p>
                                    <p><strong>Costo Final de Orden de Artículo:</strong> {item.Costo_Final_de_Orden_de_Articulo}</p>
                                    <p><strong>Número de Orden de Compra:</strong> {item.Numero_de_Orden_de_Compra}</p>
                                    <p><strong>Nombre de Archivo de Orden de Compra:</strong> {item.Nombre_de_Archivo_de_Orden_de_Compra}</p>
                                    <p><strong>Nombre de Suplidor:</strong> {item.Nombre_de_Suplidor}</p>
                                    <p><strong>Teléfono de Contacto de Suplidor:</strong> {item.Telefono_de_Contacto_de_Suplidor}</p>
                                    <p><strong>Email de Suplidor:</strong> {item.Email_de_Suplidor}</p>
                                    {/* <p><strong>URL de Archivo de Orden de Compra:</strong> <a href={item.Url_de_Archivo_de_Orden_de_Compra} target="_blank" rel="noopener noreferrer">{item.Url_de_Archivo_de_Orden_de_Compra}</a></p> */}
                                    <p><strong>URL de Archivo de Orden de Compra:</strong>
                                        <button className={`${css.buttonStructure} ${css.urlItemPdf}`} onClick={() => handleDataPointUrlClick(item.Url_de_Archivo_de_Orden_de_Compra)}>
                                            {item.Url_de_Archivo_de_Orden_de_Compra}
                                        </button>
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p>No data points found</p>
                        )}
                    </div>
                </PivotItem>
                <PivotItem
                    itemKey={AnalysisPanelTabs.CitationTab}
                    headerText="Citation"
                    headerButtonProps={isDisabledCitationTab ? pivotItemDisabledStyle : undefined}
                >
                    {/* <iframe title="Citation" src={iframeSrc} width="100%" height={citationHeight}/> */}
                    <div className={styles.thoughtProcess}>
                        {activeCitation ? (
                            <button className={`${css.buttonStructure} ${css.buttonCitation}`} onClick={handlePdfButtonClick}>{extractFilename(activeCitation)}</button>  // Show the extracted file name on the button
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
{/* {Items1.data_points && Items1.data_points.length > 0 ? (
                            Items1.data_points.map((item, index) => (
                                <div key={index}>
                                    <p>Número de Caso: {item.Numero_de_Caso}</p>
                                    <p>Costo Unitario Estimado del Artículo: {item.Costo_Unitario_Estimado_de_Articulo}</p>
                                    {/* Other fields... */}

{/* Render the button for the URL */ }
{/* {item.Url_de_Archivo_de_Orden_de_Compra && (
                                        <button
                                            onClick={() => window.open(item.Url_de_Archivo_de_Orden_de_Compra, '_blank')}
                                            className="archivo-button"
                                        >
                                            Archivo de Orden de Compra
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No data points found</p>
                        )} */}

{/* 
{Items1.data_points && Items1.data_points.length > 0 ? (
                            // Check if data_points is an array; if so, join the elements into a single string
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(Array.isArray(Items1.data_points) ? Items1.data_points.join('') : Items1.data_points) }} />
                        ) : (
                            <p>No data points found</p>
                        )} */}