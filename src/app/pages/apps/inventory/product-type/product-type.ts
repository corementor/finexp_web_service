import { Component, OnInit } from '@angular/core';
import { ProductTypeDto } from '../../../../common/dto/inventory/productType-dto';
import { InventoryService } from '../service/inventory-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-product-type',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
}
