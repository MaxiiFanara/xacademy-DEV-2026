import { Component, input } from '@angular/core';
import { PlayerDetailData } from '../../../core/models/player.model';


// PrimeNG
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-player-card-header',
  imports: [CardModule, TagModule],
  templateUrl: './player-card-header.html',
  styleUrl: './player-card-header.scss'
})
export class PlayerCardHeader {
player = input.required<PlayerDetailData>();}