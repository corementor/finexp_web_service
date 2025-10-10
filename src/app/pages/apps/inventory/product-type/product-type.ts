import { Component, OnInit } from '@angular/core';
import { ProductTypeDto } from '../../../../common/dto/inventory/productType-dto';
import { InventoryService } from '../service/inventory-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-type',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './product-type.html',
  styleUrls: ['./product-type.css'],
})
export class ManageProductTypes implements OnInit {
  productTypes: ProductTypeDto[] = [];
  productForm: FormGroup;
  showModal = false;
  loading = false;
  isEditing = false;
  selectedProduct?: ProductTypeDto;
  showDeleteModal = false;
  productToDelete?: ProductTypeDto;
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  sortColumn: string = 'productName';
  sortDirection: 'asc' | 'desc' = 'asc';
  Math = Math;

  constructor(private inventoryService: InventoryService, private fb: FormBuilder) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      description: [''],
      size: [null, [Validators.required, Validators.min(0)]],
      unitPrice: [null, [Validators.required, Validators.min(0)]],
      sellUnitPrice: [null, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadProductTypes();
  }

  loadProductTypes(): void {
    this.loading = true;
    this.inventoryService.getAllProductTypes().subscribe({
      next: (data) => {
        this.productTypes = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product types:', error);
        this.loading = false;
      },
    });
  }

  openModal(productType?: ProductTypeDto): void {
    this.showModal = true;
    this.isEditing = !!productType;
    this.selectedProduct = productType;

    if (productType) {
      this.productForm.patchValue({
        productName: productType.productName,
        description: productType.description,
        size: productType.size,
        unitPrice: productType.unitPrice,
        sellUnitPrice: productType.sellUnitPrice,
      });
    } else {
      this.productForm.reset();
    }
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.loading = true;
      const productType = {
        ...this.productForm.value,
        ...(this.isEditing && { id: this.selectedProduct?.id }),
      } as ProductTypeDto;

      const action = this.isEditing
        ? this.inventoryService.updateProductType(productType)
        : this.inventoryService.createProductType(productType);

      action.subscribe({
        next: () => {
          this.loadProductTypes();
          this.closeModal();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error saving product type:', error);
          this.loading = false;
        },
      });
    }
  }

  deleteProductType(productType: ProductTypeDto): void {
    this.productToDelete = productType;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.productToDelete = undefined;
  }

  confirmDelete(): void {
    if (this.productToDelete) {
      this.loading = true;
      this.inventoryService.deleteProductType(this.productToDelete).subscribe({
        next: () => {
          this.loadProductTypes();
          this.closeDeleteModal();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting product type:', error);
          this.loading = false;
        },
      });
    }
  }

  get filteredProducts(): ProductTypeDto[] {
    let filtered = [...this.productTypes];

    // Apply search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.productName?.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term) ||
          product.size?.toString().includes(term) ||
          product.unitPrice?.toString().includes(term) ||
          product.sellUnitPrice?.toString().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.sortColumn) {
        case 'productName':
          comparison = String(a.productName || '').localeCompare(String(b.productName || ''));
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'unitPrice':
          comparison = (a.unitPrice || 0) - (b.unitPrice || 0);
          break;
        case 'sellUnitPrice':
          comparison = (a.sellUnitPrice || 0) - (b.sellUnitPrice || 0);
          break;
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

  onSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  clearFilters() {
    this.searchTerm = '';
    this.currentPage = 1;
    this.sortColumn = 'productName';
    this.sortDirection = 'asc';
  }
}
