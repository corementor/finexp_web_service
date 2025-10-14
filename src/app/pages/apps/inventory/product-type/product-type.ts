import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { InventoryService } from '../service/inventory-service';
import { ProductTypeDto } from '../../../../common/dto/inventory/productType-dto';
import { ToasterService } from '../../../../services/toaster.service';

@Component({
  selector: 'app-product-type',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './product-type.html',
  styleUrl: './product-type.css',
})
export class ProductType implements OnInit {
  productTypes: ProductTypeDto[] = [];
  productForm: FormGroup;
  showModal = false;
  showDeleteModal = false;
  isEditing = false;
  loading = false;
  currentProductType?: ProductTypeDto;
  productToDelete?: ProductTypeDto;

  // Pagination & Filtering
  searchTerm = '';
  itemsPerPage = 5;
  currentPage = 1;
  sortColumn: keyof ProductTypeDto = 'productName';
  sortDirection: 'asc' | 'desc' = 'asc';
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private toaster: ToasterService
  ) {
    this.productForm = this.createForm();
  }

  ngOnInit() {
    this.loadProductTypes();
  }

  createForm(): FormGroup {
    return this.fb.group({
      productName: ['', Validators.required],
      description: [''],
      size: [null, [Validators.required, Validators.min(0.01)]],
      unitPrice: [null, [Validators.required, Validators.min(0.01)]],
      sellUnitPrice: [null, [Validators.required, Validators.min(0.01)]],
    });
  }

  loadProductTypes() {
    this.loading = true;
    this.inventoryService.getAllProductTypes().subscribe({
      next: (response) => {
        this.productTypes = response;
        this.loading = false;
        this.toaster.success('Product Types', `Loaded ${response.length} products successfully`);
      },
      error: (error) => {
        console.error('Error loading product types:', error);
        this.loading = false;
        this.toaster.error('Product Types', 'Failed to load product types');
      },
    });
  }

  openModal(productType?: ProductTypeDto) {
    this.isEditing = !!productType;
    this.currentProductType = productType;

    if (productType) {
      this.productForm.patchValue({
        productName: productType.productName,
        description: productType.description,
        size: productType.size,
        unitPrice: productType.unitPrice,
        sellUnitPrice: productType.sellUnitPrice,
      });
      this.toaster.info('Edit Mode', 'Editing product type');
    } else {
      this.productForm.reset();
      this.toaster.info('Create Mode', 'Fill in the form to add a new product');
    }

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.productForm.reset();
    this.currentProductType = undefined;
    this.isEditing = false;
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.loading = true;

      const productData: ProductTypeDto = {
        ...this.currentProductType,
        ...this.productForm.value,
      };

      const request = this.isEditing
        ? this.inventoryService.updateProductType(productData)
        : this.inventoryService.createProductType(productData);

      request.subscribe({
        next: (response) => {
          this.loading = false;

          if (response.status >= 200 && response.status < 300) {
            const action = this.isEditing ? 'updated' : 'created';
            this.toaster.success(
              'Success',
              `Product type ${action} successfully: ${productData.productName}`
            );

            this.closeModal();
            this.loadProductTypes();
          } else {
            this.toaster.error(
              'Operation Failed',
              response.body?.message ||
                `Failed to ${this.isEditing ? 'update' : 'create'} product type`
            );
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error saving product type:', error);
          this.toaster.error(
            'Error',
            error.message ||
              `An error occurred while ${this.isEditing ? 'updating' : 'creating'} the product type`
          );
        },
      });
    } else {
      this.markFormGroupTouched(this.productForm);
      this.toaster.warning('Form Validation', 'Please fill in all required fields correctly');
    }
  }

  deleteProductType(productType: ProductTypeDto) {
    this.productToDelete = productType;
    this.showDeleteModal = true;
    this.toaster.info('Delete Confirmation', 'Review the product details before deleting');
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.productToDelete = undefined;
  }

  confirmDelete() {
    if (!this.productToDelete?.id) {
      this.toaster.error('Delete Error', 'No product selected for deletion');
      return;
    }

    this.loading = true;

    this.inventoryService.deleteProductType(this.productToDelete).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.status >= 200 && response.status < 300) {
          this.toaster.success(
            'Deleted',
            `Product type "${this.productToDelete?.productName}" deleted successfully`
          );

          this.closeDeleteModal();
          this.loadProductTypes();
        } else {
          this.toaster.error(
            'Delete Failed',
            response.body?.message || 'Failed to delete product type'
          );
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error deleting product type:', error);
        this.toaster.error(
          'Delete Error',
          error.message || 'An error occurred while deleting the product type'
        );
      },
    });
  }

  // Filtering and Sorting
  get filteredProducts(): ProductTypeDto[] {
    let filtered = [...this.productTypes];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.productName?.toLowerCase().includes(term) ||
          product.productCode?.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term) ||
          product.size?.toString().includes(term)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[this.sortColumn];
      const bValue = b[this.sortColumn];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  get paginatedProducts(): ProductTypeDto[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onSort(column: keyof ProductTypeDto) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.toaster.info('Sorting', `Sorted by ${column} (${this.sortDirection}ending)`);
  }

  clearFilters() {
    this.searchTerm = '';
    this.currentPage = 1;
    this.sortColumn = 'productName';
    this.sortDirection = 'asc';
    this.toaster.info('Filters Cleared', 'All filters have been reset');
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
