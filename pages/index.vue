<template>
  <div>
    <h2>Student List</h2>

    <!-- Global Search and Actions -->
    <div class="container">
      <InputText v-model="filters.global.value" placeholder="Global Search" class="w-1/3" />
      <div>
        <Button label="Export to Excel" icon="pi pi-file-excel" @click="exportExcel" class="mr-2" />

        <Button label="Export to PDF" icon="pi pi-file-pdf" @click="exportPDF" />
      </div>
      <div>
        <RouterLink to="/upload-image" class="btn btn-primary">
          <Button>Task 2</Button>
        </RouterLink>
      </div>
    </div>

    <!-- Column Selection -->
    <div class="column-selection">
      <h4>Select Columns to Display</h4>
      <div>
        <div v-for="field in fieldOptions" :key="field.value" class="checkbox-field">
          <Checkbox v-model="selectedFields" :value="field.value" />
          <label>{{ field.label }}</label>
        </div>
      </div>
    </div>

    <!-- DataTable -->
    <DataTable
      v-model:filters="filters"
      :value="students"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[10, 25, 50]"
      :resizableColumns="true"
      :scrollable="true"
      :scrollHeight="'500px'"
      tableStyle="min-width: 70rem"
      selectionMode="multiple"
      v-model:selection="selectedRows"
      :globalFilterFields="globalFilterFields"
      :loading="loading"
      filterDisplay="menu"
    >
      <template #header>
        <div class="flex justify-between">
          <Button type="button" icon="pi pi-filter-slash" label="Clear Filters" outlined @click="clearFilter" />
        </div>
      </template>
      <template #empty> No students found. </template>
      <template #loading> Loading students data. Please wait. </template>

      <!-- Selection Column -->
      <Column selectionMode="multiple" style="width: 3rem"></Column>

      <!-- Dynamic Columns with Filters -->
      <Column
        v-for="field in selectedFields"
        :key="field"
        :field="field"
        :header="getFieldLabel(field)"
        :sortable="true"
        :filter="true"
        :filterPlaceholder="'Search ' + getFieldLabel(field)"
        :filterMatchMode="FilterMatchMode.CONTAINS"
      >
        <!-- Filter Logic -->
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" :placeholder="'Search by ' + getFieldLabel(field)" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>





<script setup>
import { ref, onMounted, computed } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";

import jsPDF from "jspdf";
import "jspdf-autotable";
import "primeicons/primeicons.css";
import { RouterLink } from "vue-router";

// Reactive data
const students = ref([]);
const selectedRows = ref([]);
const loading = ref(true);

// Column options for dynamic display
const fieldOptions = ref([
  { label: "Student ID", value: "custom_student_id" },
  { label: "Class Roll", value: "class_roll" },
  { label: "Status", value: "student.status" },
  { label: "Name", value: "student_details.student_name" },
  { label: "Gender", value: "student_details.student_gender" },
  { label: "Religion", value: "student_details.student_religion" },
  { label: "Academic Session", value: "academicsession.coresubcategories.core_subcategory_name" },
  { label: "Category", value: "categories.coresubcategories.core_subcategory_name" },
  { label: "Father's Mobile", value: "guardian_details.father_mobile" },
  { label: "Group", value: "combination.academic_class_detail.groups.core_subcategory_name" },
]);

// Default: All fields selected
const selectedFields = ref(fieldOptions.value.map((field) => field.value));

// Filters for columns and global
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  // Make sure each filter has constraints initialized
  custom_student_id: { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  class_roll: { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
  "student_details.student_name": { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  "student_details.student_gender": { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
  "student_details.student_religion": { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  "academicsession.coresubcategories.core_subcategory_name": { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  "categories.coresubcategories.core_subcategory_name": { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  "guardian_details.father_mobile": { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  "combination.academic_class_detail.groups.core_subcategory_name": { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
});

const globalFilterFields = computed(() => selectedFields.value);

// Fetch student data
const fetchStudents = async () => {
  try {
    const response = await fetch("https://wmer3.wiremockapi.cloud/api/v1/student-list");
    if (!response.ok) throw new Error("Failed to fetch data");
    students.value = await response.json();
  } catch (error) {
    console.error("Failed to fetch students:", error.message);
  } finally {
    loading.value = false;
  }
};

// Get label for a given field
const getFieldLabel = (fieldValue) => {
  const field = fieldOptions.value.find((f) => f.value === fieldValue);
  return field ? field.label : fieldValue;
};

// Clear all filters
const clearFilter = () => {
  // Reset the filters object to its initial state
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    custom_student_id: { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    class_roll: { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    "student_details.student_name": { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    "student_details.student_gender": { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    "student_details.student_religion": { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    "academicsession.coresubcategories.core_subcategory_name": { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    "categories.coresubcategories.core_subcategory_name": { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    "guardian_details.father_mobile": { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    "combination.academic_class_detail.groups.core_subcategory_name": { operator: "AND", constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  };
};


// Export selected data to Excel
const exportExcel = async () => {
  try {
    const { utils, writeFile } = await import("xlsx");

    // Prepare the data for Excel based on selected rows or all visible rows
    const data = (selectedRows.value.length > 0 ? selectedRows.value : students.value).map((student) => {
      const row = {};
      selectedFields.value.forEach((field) => {
        const fieldParts = field.split(".");
        let value = student;
        fieldParts.forEach((part) => {
          value = value ? value[part] : null;
        });
        row[getFieldLabel(field)] = value || ""; // Use column label as header
      });
      return row;
    });

    if (data.length === 0) {
      console.warn("No data available for export.");
      return;
    }

    // Create a worksheet and workbook
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Students");

    // Save the workbook as an Excel file
    writeFile(workbook, "students.xlsx");

    console.log("Excel report generated successfully.");
  } catch (error) {
    console.error("Failed to export to Excel:", error.message);
  }
};


// Export selected data to PDF
const exportPDF = () => {
  const doc = new jsPDF();
  const tableColumns = selectedFields.value.map(getFieldLabel);
  const tableRows = selectedRows.value.map((student) => {
    return selectedFields.value.map((field) => {
      const fieldParts = field.split(".");
      let value = student;
      fieldParts.forEach((part) => {
        value = value ? value[part] : null;
      });
      return value;
    });
  });

  // If no rows are selected, export all visible rows
  if (tableRows.length === 0) {
    students.value.forEach((student) => {
      const row = selectedFields.value.map((field) => {
        const fieldParts = field.split(".");
        let value = student;
        fieldParts.forEach((part) => {
          value = value ? value[part] : null;
        });
        return value;
      });
      tableRows.push(row);
    });
  }

  doc.autoTable({
    head: [tableColumns],
    body: tableRows,
    styles: { fontSize: 8, halign: "center" },
    headStyles: { fillColor: [22, 160, 133] },
  });
  doc.save("students.pdf");
};

// Fetch data on component mount
onMounted(fetchStudents);
</script>








<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.column-selection {
  margin-bottom: 1rem;
}

.checkbox-field {
  display: inline-block;
  margin-right: 1rem;
}
</style>
