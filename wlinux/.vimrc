set mouse=a
set term=screen-256color
set number
syntax on
set autoindent
set noexpandtab
set guifont=Fira\ Code
let g:airline_powerline_fonts = 1
let g:airline#extensions#tabline#enabled = 1
" Always show statusline
set laststatus=2
set pastetoggle=<F10>
nnoremap <silent> <F4> :bnext<CR>
nnoremap <silent> <F3> :bprev<CR>
" Use 256 colours (Use this setting only if your terminal supports 256 colours)
set t_Co=256
set nocompatible              " be iMproved, required
filetype off                  " required

" set the runtime path to include Vundle and initialize
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()
" alternatively, pass a path where Vundle should install plugins
"call vundle#begin('~/some/path/here')

" let Vundle manage Vundle, required
Plugin 'VundleVim/Vundle.vim'

Plugin 'godlygeek/tabular'

Plugin 'vim-airline/vim-airline'

Plugin 'vim-airline/vim-airline-themes'

" All of your Plugins must be added before the following line
call vundle#end()            " required
filetype plugin indent on    " required
" To ignore plugin indent changes, instead use:
"filetype plugin on
let g:vim_markdown_folding_disabled=1
