<template>
  <div>
    <h2>Student List</h2>

    <!-- Global Search -->
    <div class="container">
      <InputText v-model="filters.global.value" placeholder="Global Search" class="w-1/3" />
      <div >
        <Button label="Export to Excel" icon="pi pi-file-excel" @click="exportExcel" class="mr-2" />
        <Button label="Export to PDF" icon="pi pi-file-pdf" @click="exportPDF" />
      </div>
      <div>
        <RouterLink to="/upload-image" class="btn btn-primary">
          <Button>Task 2</Button>
        </RouterLink>
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
      :sortMode="'multiple'"
      :scrollable="true"
      :scrollHeight="'500px'"
      tableStyle="min-width: 70rem"
      selectionMode="multiple"
      v-model:selection="selectedRows"
      filterDisplay="menu"
      :globalFilterFields="[
        'custom_student_id',
        'class_roll',
        'student.status',
        'student_details.student_name',
        'student_details.student_gender',
        'student_details.student_religion',
        'academicsession.coresubcategories.core_subcategory_name',
        'categories.coresubcategories.core_subcategory_name',
        'guardian_details.father_mobile',
        'combination.academic_class_detail.groups.core_subcategory_name'
      ]"
      :loading="loading"
    >
      <template #header>
        <div class="flex justify-between">
          <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter" />
        </div>
      </template>
      <template #empty> No students found. </template>
      <template #loading> Loading students data. Please wait. </template>

      <!-- Columns -->
      <Column selectionMode="multiple" style="width: 3rem"></Column>
      <Column field="custom_student_id" header="Student ID" :sortable="true" :filter="true" :filterMatchMode="FilterMatchMode.CONTAINS">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search by Student ID" />
        </template>
      </Column>
      <Column field="class_roll" header="Class Roll" :sortable="true" :filter="true" :filterMatchMode="FilterMatchMode.EQUALS">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search by Class Roll" />
        </template>
      </Column>
      <Column field="student.status" header="Status" :sortable="true" :filter="true" :filterMatchMode="FilterMatchMode.STARTS_WITH">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search by Status" />
        </template>
      </Column>
      <Column field="student_details.student_name" header="Name" :sortable="true" :filter="true" :filterMatchMode="FilterMatchMode.CONTAINS">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search by Name" />
        </template>
      </Column>
      <Column field="student_details.student_gender" header="Gender" :sortable="true" :filter="true" :filterMatchMode="FilterMatchMode.EQUALS">
        <template #filter="{ filterModel }">
          <Select v-model="filterModel.value" :options="['Male', 'Female', 'Other']" placeholder="Select Gender" />
        </template>
      </Column>
      <Column field="student_details.student_religion" header="Religion" :sortable="true" :filter="true" :filterMatchMode="FilterMatchMode.CONTAINS">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search by Religion" />
        </template>
      </Column>
      <Column field="academicsession.coresubcategories.core_subcategory_name" header="Academic Session" :sortable="true" :filter="true" :filterMatchMode="FilterMatchMode.CONTAINS">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search by Academic Session" />
        </template>
      </Column>
      <Column field="categories.coresubcategories.core_subcategory_name" header="Category" :sortable="true" :filter="true" :filterMatchMode="FilterMatchMode.STARTS_WITH">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search by Category" />
        </template>
      </Column>
      <Column field="guardian_details.father_mobile" header="Father's Mobile" :sortable="true" :filter="true" :filterMatchMode="FilterMatchMode.CONTAINS">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search by Father's Mobile" />
        </template>
      </Column>
      <Column field="combination.academic_class_detail.groups.core_subcategory_name" header="Group" :sortable="true" :filter="true" :filterMatchMode="FilterMatchMode.CONTAINS">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search by Group" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode,FilterOperator } from '@primevue/core/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import 'primeicons/primeicons.css';
import { RouterLink } from 'vue-router';
const students = ref([]);
const selectedRows = ref([]);
const loading = ref(true);
const filter = ref({}); // Reactive filters object
XLSX.set_fs(null);

const initFilters = () => {
  filter.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    student_id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    class_roll: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    'country.name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    balance: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    verified: { value: null, matchMode: FilterMatchMode.EQUALS },
    status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    activity: { value: [0, 100], matchMode: FilterMatchMode.BETWEEN },
  };
};

// Initialize filters on component load
initFilters();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  custom_student_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
  class_roll: { value: null, matchMode: FilterMatchMode.EQUALS },
  'student.status': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'student_details.student_name': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'student_details.student_gender': { value: null, matchMode: FilterMatchMode.EQUALS },
  'student_details.student_religion': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'academicsession.coresubcategories.core_subcategory_name': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'categories.coresubcategories.core_subcategory_name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'guardian_details.father_mobile': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'combination.academic_class_detail.groups.core_subcategory_name': { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Fetch student data
const fetchStudents = async () => {
  try {
    const response = await fetch('https://wmer3.wiremockapi.cloud/api/v1/student-list');
    students.value = await response.json();
    loading.value = false;
  } catch (error) {
    console.error('Failed to fetch students:', error.message);
    loading.value = false;
  }
};

// Clear all filters
const clearFilter = () => {
  // Iterate over all existing filters and reset their value
  Object.keys(filters.value).forEach((key) => {
    if (filters.value[key]?.constraints) {
      // For filters with constraints (e.g., AND/OR logic)
      filters.value[key].constraints.forEach((constraint) => {
        constraint.value = null;
      });
    } else {
      // For filters without constraints
      filters.value[key].value = null;
    }

    // Reset matchMode if required (optional)
    filters.value[key].matchMode = filters.value[key].matchMode || FilterMatchMode.CONTAINS;
  });

  // Reset global filter explicitly
  if (filters.value.global) {
    filters.value.global.value = null;
    filters.value.global.matchMode = FilterMatchMode.CONTAINS;
  }

  console.log('Filters cleared:', filters.value); // Debugging (optional)
};


// Export to Excel
const exportExcel = () => {
  const data = selectedRows.value.map((student) => ({
    'Student ID': student.custom_student_id,
    'Class Roll': student.class_roll,
    'Status': student.student?.status,
    'Name': student.student_details?.student_name,
    'Gender': student.student_details?.student_gender,
    'Religion': student.student_details?.student_religion,
    'Academic Session': student.academicsession?.coresubcategories?.core_subcategory_name,
    'Category': student.categories?.coresubcategories?.core_subcategory_name,
    'Father\'s Mobile': student.guardian_details?.father_mobile,
    'Group': student.combination?.academic_class_detail?.groups?.core_subcategory_name
  }));
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  XLSX.writeFile(workbook, 'students.xlsx');
};

// Export to PDF
const exportPDF = () => {
  const doc = new jsPDF();
  const tableColumns = [
    'Student ID',
    'Class Roll',
    'Status',
    'Name',
    'Gender',
    'Religion',
    'Academic Session',
    'Category',
    'Father\'s Mobile',
    'Group'
  ];
  const tableRows = selectedRows.value.map((student) => [
    student.custom_student_id,
    student.class_roll,
    student.student?.status,
    student.student_details?.student_name,
    student.student_details?.student_gender,
    student.student_details?.student_religion,
    student.academicsession?.coresubcategories?.core_subcategory_name,
    student.categories?.coresubcategories?.core_subcategory_name,
    student.guardian_details?.father_mobile,
    student.combination?.academic_class_detail?.groups?.core_subcategory_name
  ]);
  doc.autoTable({
    head: [tableColumns],
    body: tableRows,
    styles: { fontSize: 8, halign: 'center' },
    headStyles: { fillColor: [22, 160, 133] }
  });
  doc.save('students.pdf');
};

onMounted(fetchStudents);
</script>
<style scoped>
.container{
  display:flex;
  flex-direction: row;
  gap:5px;
}
</style>